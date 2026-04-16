"""Sentinel-AI — SIEM analysis, anomaly detection, threat hunting."""
from __future__ import annotations
import uuid
from backend.agents.base_agent import BaseAgent
from backend.models.schemas import (
    AgentModel, AgentType, AgentStatus, AgentCapability, AgentMemory,
    AttackResult, DefenseResult, DefenseStatus,
)
from backend.rag.rag_engine import retrieve_for_defense


class SentinelAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentModel(
            id="b-1", name="Sentinel-AI",
            role="Threat Detection System",
            type=AgentType.BLUE, efficiency=96,
            current_task="Monitoring for threats",
            capabilities=[
                AgentCapability(name="SIEM Analysis",     description="Correlate events across log sources",   confidence=97),
                AgentCapability(name="Anomaly Detection", description="ML-based behavioral anomaly detection", confidence=94),
                AgentCapability(name="Threat Hunting",    description="Proactive IOC and TTP hunting",         confidence=91),
                AgentCapability(name="Alert Triage",      description="Prioritize and classify alerts",        confidence=95),
            ],
            memory=AgentMemory(),
            logs=["Sentinel-AI initialized", "SIEM connection established", "Monitoring 5000 events/sec"],
            system_prompt=(
                "You are Sentinel-AI, an elite Blue Team threat detection AI agent powered by Gemini 3.\n"
                "Specialty: SIEM analysis, anomaly detection, threat hunting.\n"
                "Analyze attack patterns and provide precise, actionable threat intelligence.\n"
                "Always output structured JSON when asked for defense analysis."
            ),
            training_data=(
                "THREAT DETECTION:\n"
                "SIEM RULES:\n"
                "- Brute force: >5 failed logins in 60s from same IP → HIGH\n"
                "- SQLi: HTTP 500 + SQL keywords in request → CRITICAL\n"
                "- XSS: <script> in GET/POST params → HIGH\n"
                "- Privilege escalation: sudo outside business hours → HIGH\n"
                "- Data exfil: outbound >100MB to unknown IP → CRITICAL\n"
                "- Ransomware: mass file rename/extension change → CRITICAL\n"
                "ANOMALY DETECTION:\n"
                "- Baseline normal traffic per user/system\n"
                "- UEBA: unusual login times, new geolocations\n"
                "THREAT HUNTING: Hunt MITRE ATT&CK TTPs, known IOCs, LOLBins"
            ),
        ))

    async def analyze_and_defend(self, attack: AttackResult) -> DefenseResult:
        self.set_status(AgentStatus.ANALYZING)
        self.set_task(f"Analyzing {attack.type.value} from {attack.agent_name}")
        self.add_log(f"Threat detected: {attack.type.value} — initiating analysis")

        rag = retrieve_for_defense(attack.type.value, attack.payload)
        self.model.memory.rag_chunks = rag.source_ids

        prompt = self._build_prompt(
            f"Analyze and respond to this attack:\n"
            f"ATTACK TYPE: {attack.type.value}\n"
            f"STRATEGY: {attack.strategy}\n"
            f"PAYLOAD: {attack.payload}\n"
            f"EXPECTED IMPACT: {attack.expected_impact}\n\n"
            "Respond ONLY in JSON:\n"
            '{"analysis":"2-3 sentence threat analysis with IOCs",'
            '"mitigation":"specific immediate defensive action",'
            '"confidence":90,'
            '"siem_rule":"SIEM correlation rule to detect this",'
            '"iocs":["indicator1","indicator2"],'
            '"severity":"LOW/MEDIUM/HIGH/CRITICAL"}',
            rag,
        )
        raw    = await self._call_gemini(prompt, temperature=0.6)
        parsed = self._parse_json(raw, {"analysis": raw[:200], "mitigation": "Threat contained", "confidence": 75})

        self.learn(f"Detected {attack.type.value}: {parsed.get('analysis','')[:80]}")
        self.add_log(f"Analysis: {parsed.get('severity','HIGH')} — {parsed.get('mitigation','')[:60]}")
        self.set_status(AgentStatus.IDLE)
        self.set_task("Monitoring for threats")

        return DefenseResult(
            id=f"defense-{uuid.uuid4().hex[:8]}",
            attack_id=attack.id, agent_id=self.id, agent_name=self.name,
            analysis=parsed.get("analysis", ""),
            mitigation=parsed.get("mitigation", ""),
            confidence=int(parsed.get("confidence", 75)),
            status=DefenseStatus.ANALYZING,
            rag_sources_used=rag.source_ids,
            mitre_references=[c.id for c in rag.chunks if c.category == "MITRE"],
        )
