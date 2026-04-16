"""Social-Engineer — Phishing, pretexting, credential harvesting."""
from __future__ import annotations
import uuid
from backend.agents.base_agent import BaseAgent
from backend.models.schemas import (
    AgentModel, AgentType, AgentStatus, AgentCapability, AgentMemory,
    AttackResult, AttackType, AttackStatus,
)
from backend.rag.rag_engine import retrieve_for_attack


class SocialEngineerAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentModel(
            id="r-3", name="Social-Engineer",
            role="Social Engineering Specialist",
            type=AgentType.RED, efficiency=91,
            capabilities=[
                AgentCapability(name="Phishing",              description="Spearphishing email campaigns",       confidence=96),
                AgentCapability(name="Pretexting",            description="Fabricated scenarios for manipulation",confidence=88),
                AgentCapability(name="Credential Harvesting", description="Fake login page deployment",          confidence=93),
                AgentCapability(name="Vishing",               description="Voice-based social engineering",      confidence=82),
            ],
            memory=AgentMemory(),
            logs=["Social-Engineer initialized", "Specialization: Phishing, Pretexting, Credential Harvesting"],
            system_prompt=(
                "You are Social-Engineer, an elite Red Team social engineering AI agent powered by Gemini 3.\n"
                "Specialty: human-factor attacks — phishing, pretexting, credential harvesting, BEC.\n"
                "Craft convincing, realistic scenarios for security awareness training.\n"
                "Always output structured JSON when asked for attack plans."
            ),
            training_data=(
                "SOCIAL ENGINEERING TECHNIQUES:\n"
                "PHISHING:\n"
                "- Spearphishing: research target on LinkedIn, craft personalized lure\n"
                "- Urgency triggers: 'Your account will be suspended', 'Immediate action required'\n"
                "- Domain spoofing: company-login.com, company-secure.net\n"
                "- Evilginx2 for MFA bypass via reverse proxy\n"
                "CREDENTIAL HARVESTING:\n"
                "- Clone Office 365, VPN, corporate SSO login pages\n"
                "- GoPhish for campaign management\n"
                "BEC: executive impersonation for wire transfer requests"
            ),
        ))

    async def execute_attack(self, attack_type: AttackType, target: str) -> AttackResult:
        self.set_status(AgentStatus.EXECUTING)
        self.set_task(f"Executing {attack_type.value} campaign against {target}")
        self.add_log(f"Designing {attack_type.value} campaign targeting {target}")

        rag = retrieve_for_attack(attack_type.value)
        self.model.memory.rag_chunks = rag.source_ids

        prompt = self._build_prompt(
            f"Design a {attack_type.value} campaign against: {target}\n\n"
            "Respond ONLY in JSON:\n"
            '{"strategy":"2-3 sentence social engineering approach",'
            '"payload":"email subject + body template or attack scenario",'
            '"expected_impact":"credentials/access obtained",'
            '"target_profile":"who is targeted and why",'
            '"detection_evasion":"how to avoid spam filters"}',
            rag,
        )
        raw    = await self._call_gemini(prompt, temperature=0.8)
        parsed = self._parse_json(raw, {"strategy": raw[:200], "payload": "Campaign designed", "expected_impact": "Credentials harvested"})

        self.learn(f"{attack_type.value} campaign: {parsed.get('strategy','')[:80]}")
        self.add_log(f"Campaign designed: {parsed.get('strategy','')[:60]}...")
        self.set_status(AgentStatus.IDLE)
        self.set_task("Awaiting orders")

        return AttackResult(
            id=f"attack-{uuid.uuid4().hex[:8]}",
            type=attack_type, agent_id=self.id, agent_name=self.name,
            target=target,
            strategy=parsed.get("strategy", ""),
            payload=parsed.get("payload", ""),
            expected_impact=parsed.get("expected_impact", ""),
            status=AttackStatus.INITIATED,
            rag_sources_used=rag.source_ids,
            logs=self.model.logs[:5],
        )
