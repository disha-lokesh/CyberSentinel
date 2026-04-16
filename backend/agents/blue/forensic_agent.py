"""Forensic-Bot — Incident response, log analysis, attack attribution."""
from __future__ import annotations
import uuid
from backend.agents.base_agent import BaseAgent
from backend.models.schemas import (
    AgentModel, AgentType, AgentStatus, AgentCapability, AgentMemory,
    AttackResult, DefenseResult, DefenseStatus,
)
from backend.rag.rag_engine import retrieve_for_defense


class ForensicAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentModel(
            id="b-3", name="Forensic-Bot",
            role="Incident Response & Forensics",
            type=AgentType.BLUE, efficiency=93,
            current_task="Monitoring for incidents",
            capabilities=[
                AgentCapability(name="Log Analysis",       description="Multi-source log correlation",        confidence=95),
                AgentCapability(name="Malware Analysis",   description="Static and dynamic malware analysis", confidence=88),
                AgentCapability(name="Attack Attribution", description="TTP-based threat actor attribution",  confidence=85),
                AgentCapability(name="Evidence Collection",description="Forensically sound preservation",     confidence=92),
            ],
            memory=AgentMemory(),
            logs=["Forensic-Bot initialized", "Log ingestion pipeline active", "Evidence vault ready"],
            system_prompt=(
                "You are Forensic-Bot, an elite Blue Team incident response and digital forensics AI agent powered by Gemini 3.\n"
                "Specialty: log analysis, malware analysis, attack attribution, evidence collection.\n"
                "Reconstruct attack timelines and provide detailed forensic reports.\n"
                "Always output structured JSON when asked for defense analysis."
            ),
            training_data=(
                "INCIDENT RESPONSE (NIST SP 800-61):\n"
                "1. Identification: correlate SIEM alerts, determine scope\n"
                "2. Containment: isolate systems, block IPs, preserve evidence\n"
                "3. Eradication: remove malware, patch vulns, reset credentials\n"
                "4. Recovery: restore from clean backups, monitor re-infection\n"
                "5. Lessons Learned: document timeline, update playbooks\n"
                "LOG ANALYSIS:\n"
                "- Web logs: correlate IP, user-agent, request patterns\n"
                "- Auth logs: failed logins, privilege escalation, new accounts\n"
                "- Process logs: unusual parent-child relationships, LOLBins\n"
                "MALWARE ANALYSIS:\n"
                "- Static: file hash (VirusTotal), strings, PE headers, YARA\n"
                "- Dynamic: sandbox (Cuckoo, Any.run), network traffic, registry"
            ),
        ))

    async def analyze_and_defend(self, attack: AttackResult) -> DefenseResult:
        self.set_status(AgentStatus.ANALYZING)
        self.set_task(f"Investigating {attack.type.value} incident")
        self.add_log(f"Incident opened: {attack.type.value} — collecting evidence")

        rag = retrieve_for_defense(attack.type.value, attack.payload)
        self.model.memory.rag_chunks = rag.source_ids

        prompt = self._build_prompt(
            f"Conduct forensic investigation:\n"
            f"ATTACK TYPE: {attack.type.value}\n"
            f"STRATEGY: {attack.strategy}\n"
            f"PAYLOAD: {attack.payload}\n"
            f"EXPECTED IMPACT: {attack.expected_impact}\n\n"
            "Respond ONLY in JSON:\n"
            '{"analysis":"forensic analysis with attack timeline and IOCs",'
            '"mitigation":"containment and eradication steps",'
            '"confidence":88,'
            '"attack_timeline":["T+0: initial access","T+5min: lateral movement"],'
            '"evidence_collected":["log file","memory dump"],'
            '"attribution":"likely threat actor based on TTPs"}',
            rag,
        )
        raw    = await self._call_gemini(prompt, temperature=0.6)
        parsed = self._parse_json(raw, {"analysis": raw[:200], "mitigation": "Incident contained", "confidence": 80})

        self.learn(f"{attack.type.value} forensics: {parsed.get('attribution','Unknown actor')}")
        self.add_log(f"Investigation: {parsed.get('attribution','Attribution pending')}")
        self.set_status(AgentStatus.IDLE)
        self.set_task("Monitoring for incidents")

        return DefenseResult(
            id=f"defense-{uuid.uuid4().hex[:8]}",
            attack_id=attack.id, agent_id=self.id, agent_name=self.name,
            analysis=parsed.get("analysis", ""),
            mitigation=parsed.get("mitigation", ""),
            confidence=int(parsed.get("confidence", 80)),
            status=DefenseStatus.ANALYZING,
            rag_sources_used=rag.source_ids,
            cve_references=[c.id for c in rag.chunks if c.category == "CVE"],
            mitre_references=[c.id for c in rag.chunks if c.category == "MITRE"],
        )
