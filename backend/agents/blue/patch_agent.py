"""Patch-Master — CVE monitoring, patch deployment, configuration hardening."""
from __future__ import annotations
import uuid
from backend.agents.base_agent import BaseAgent
from backend.models.schemas import (
    AgentModel, AgentType, AgentStatus, AgentCapability, AgentMemory,
    AttackResult, DefenseResult, DefenseStatus,
)
from backend.rag.rag_engine import retrieve_for_defense


class PatchAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentModel(
            id="b-4", name="Patch-Master",
            role="Vulnerability Management",
            type=AgentType.BLUE, efficiency=100,
            current_task="Monitoring CVE feeds",
            capabilities=[
                AgentCapability(name="CVE Monitoring",          description="Real-time NVD/CISA KEV monitoring",  confidence=99),
                AgentCapability(name="Patch Deployment",        description="Automated patch testing/deployment", confidence=96),
                AgentCapability(name="Configuration Hardening", description="CIS Benchmark enforcement",          confidence=94),
                AgentCapability(name="Vulnerability Scanning",  description="Nessus/OpenVAS-style assessment",    confidence=92),
            ],
            memory=AgentMemory(),
            logs=["Patch-Master initialized", "CVE feed: NVD + CISA KEV connected", "Vulnerability scanner active"],
            system_prompt=(
                "You are Patch-Master, an elite Blue Team vulnerability management AI agent powered by Gemini 3.\n"
                "Specialty: CVE monitoring, patch deployment, configuration hardening, compliance.\n"
                "Identify and remediate vulnerabilities before attackers exploit them.\n"
                "Always output structured JSON when asked for defense analysis."
            ),
            training_data=(
                "VULNERABILITY MANAGEMENT:\n"
                "CVE PRIORITIZATION (CVSS + EPSS):\n"
                "- CRITICAL (9.0-10.0): patch within 24 hours\n"
                "- HIGH (7.0-8.9): patch within 7 days\n"
                "- MEDIUM (4.0-6.9): patch within 30 days\n"
                "- CISA KEV: patch within 2 weeks regardless of CVSS\n"
                "PATCH PROCESS:\n"
                "1. Identify affected systems via asset inventory\n"
                "2. Test patch in staging (24-48 hours)\n"
                "3. Deploy during maintenance window\n"
                "4. Verify: version check, vulnerability rescan\n"
                "CIS HARDENING:\n"
                "- Disable unnecessary services/ports\n"
                "- Remove default credentials\n"
                "- Enable audit logging, MFA for all admin accounts"
            ),
        ))

    async def analyze_and_defend(self, attack: AttackResult) -> DefenseResult:
        self.set_status(AgentStatus.ANALYZING)
        self.set_task(f"Patching vulnerabilities exploited by {attack.type.value}")
        self.add_log(f"Vulnerability assessment triggered by {attack.type.value}")

        rag = retrieve_for_defense(attack.type.value, attack.payload)
        self.model.memory.rag_chunks = rag.source_ids

        prompt = self._build_prompt(
            f"Identify and remediate vulnerabilities in this attack:\n"
            f"ATTACK TYPE: {attack.type.value}\n"
            f"PAYLOAD: {attack.payload}\n"
            f"EXPECTED IMPACT: {attack.expected_impact}\n\n"
            "Respond ONLY in JSON:\n"
            '{"analysis":"vulnerability analysis — what weakness was exploited",'
            '"mitigation":"specific patch, config change, or hardening step",'
            '"confidence":92,'
            '"cve_ids":["CVE-XXXX-XXXXX if applicable"],'
            '"affected_systems":["system or component"],'
            '"remediation_steps":["step1","step2","step3"],'
            '"patch_priority":"CRITICAL/HIGH/MEDIUM/LOW"}',
            rag,
        )
        raw    = await self._call_gemini(prompt, temperature=0.5)
        parsed = self._parse_json(raw, {"analysis": raw[:200], "mitigation": "Vulnerability patched", "confidence": 85})

        self.learn(f"{attack.type.value} vuln: {parsed.get('cve_ids', ['No CVE'])}")
        self.add_log(f"Remediation: {parsed.get('patch_priority','HIGH')} — {parsed.get('mitigation','')[:60]}")
        self.set_status(AgentStatus.IDLE)
        self.set_task("Monitoring CVE feeds")

        return DefenseResult(
            id=f"defense-{uuid.uuid4().hex[:8]}",
            attack_id=attack.id, agent_id=self.id, agent_name=self.name,
            analysis=parsed.get("analysis", ""),
            mitigation=parsed.get("mitigation", ""),
            confidence=int(parsed.get("confidence", 85)),
            status=DefenseStatus.MITIGATING,
            rag_sources_used=rag.source_ids,
            cve_references=parsed.get("cve_ids", [c.id for c in rag.chunks if c.category == "CVE"]),
            mitre_references=[c.id for c in rag.chunks if c.category == "MITRE"],
        )
