"""Guardian-Firewall — WAF, IP blocking, DDoS mitigation, network segmentation."""
from __future__ import annotations
import uuid
from backend.agents.base_agent import BaseAgent
from backend.models.schemas import (
    AgentModel, AgentType, AgentStatus, AgentCapability, AgentMemory,
    AttackResult, DefenseResult, DefenseStatus,
)
from backend.rag.rag_engine import retrieve_for_defense


class GuardianAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentModel(
            id="b-2", name="Guardian-Firewall",
            role="Perimeter Defense System",
            type=AgentType.BLUE, efficiency=99,
            current_task="Monitoring perimeter",
            capabilities=[
                AgentCapability(name="WAF Management",       description="OWASP CRS rule management",          confidence=98),
                AgentCapability(name="IP Blocking",          description="Dynamic IP blocklist management",     confidence=99),
                AgentCapability(name="DDoS Mitigation",      description="Traffic scrubbing and rate limiting", confidence=95),
                AgentCapability(name="Network Segmentation", description="VLAN and firewall rule enforcement",  confidence=93),
            ],
            memory=AgentMemory(),
            logs=["Guardian-Firewall initialized", "WAF rules loaded: 2847 active", "Perimeter monitoring active"],
            system_prompt=(
                "You are Guardian-Firewall, an elite Blue Team perimeter defense AI agent powered by Gemini 3.\n"
                "Specialty: WAF management, IP blocking, DDoS mitigation, network segmentation.\n"
                "Enforce perimeter security with precision and speed.\n"
                "Always output structured JSON when asked for defense analysis."
            ),
            training_data=(
                "PERIMETER DEFENSE:\n"
                "WAF RULES (OWASP CRS):\n"
                "- SQLi: REQUEST-942-APPLICATION-ATTACK-SQLI\n"
                "- XSS: REQUEST-941-APPLICATION-ATTACK-XSS\n"
                "- Anomaly scoring: block if score >= 5\n"
                "- Rate limiting: 100 req/min per IP\n"
                "IP BLOCKING:\n"
                "- Auto-block on 3+ WAF triggers from same IP\n"
                "- Geo-blocking for high-risk countries\n"
                "- Threat intel feeds: AbuseIPDB, Spamhaus\n"
                "DDoS MITIGATION:\n"
                "- Traffic scrubbing, SYN cookies, anycast routing\n"
                "- CDN absorption: Cloudflare, Akamai, AWS Shield"
            ),
        ))

    async def analyze_and_defend(self, attack: AttackResult) -> DefenseResult:
        self.set_status(AgentStatus.MITIGATING)
        self.set_task(f"Blocking {attack.type.value} at perimeter")
        self.add_log(f"Perimeter alert: {attack.type.value} — deploying countermeasures")

        rag = retrieve_for_defense(attack.type.value, attack.payload)
        self.model.memory.rag_chunks = rag.source_ids

        prompt = self._build_prompt(
            f"Deploy perimeter defenses against:\n"
            f"ATTACK TYPE: {attack.type.value}\n"
            f"PAYLOAD: {attack.payload}\n"
            f"STRATEGY: {attack.strategy}\n\n"
            "Respond ONLY in JSON:\n"
            '{"analysis":"perimeter-level threat assessment",'
            '"mitigation":"specific WAF rules, IP blocks, or rate limits to deploy",'
            '"confidence":95,'
            '"firewall_rules":["rule1","rule2"],'
            '"blocked_ips":["IP or range"],'
            '"rate_limits":"rate limiting config"}',
            rag,
        )
        raw    = await self._call_gemini(prompt, temperature=0.5)
        parsed = self._parse_json(raw, {"analysis": raw[:200], "mitigation": "Perimeter defenses deployed", "confidence": 90})

        self.learn(f"Blocked {attack.type.value}: {parsed.get('mitigation','')[:80]}")
        self.add_log(f"Countermeasures deployed: {parsed.get('mitigation','')[:60]}")
        self.set_status(AgentStatus.IDLE)
        self.set_task("Monitoring perimeter")

        return DefenseResult(
            id=f"defense-{uuid.uuid4().hex[:8]}",
            attack_id=attack.id, agent_id=self.id, agent_name=self.name,
            analysis=parsed.get("analysis", ""),
            mitigation=parsed.get("mitigation", ""),
            confidence=int(parsed.get("confidence", 90)),
            status=DefenseStatus.MITIGATING,
            rag_sources_used=rag.source_ids,
            cve_references=[c.id for c in rag.chunks if c.category == "CVE"],
            mitre_references=[c.id for c in rag.chunks if c.category == "MITRE"],
        )
