"""Recon-Alpha — Network scanning & OSINT specialist."""
from __future__ import annotations
import uuid
from backend.agents.base_agent import BaseAgent, AGENT_MODEL
from backend.models.schemas import (
    AgentModel, AgentType, AgentStatus, AgentCapability, AgentMemory,
    AttackResult, AttackType, AttackStatus,
)
from backend.rag.rag_engine import retrieve_for_attack


class ReconAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentModel(
            id="r-1", name="Recon-Alpha",
            role="Reconnaissance Specialist",
            type=AgentType.RED, efficiency=94,
            capabilities=[
                AgentCapability(name="Network Scanning",    description="Nmap-style port/service discovery", confidence=95),
                AgentCapability(name="OSINT",               description="Open-source intelligence gathering",  confidence=90),
                AgentCapability(name="Service Enumeration", description="Banner grabbing, version detection",  confidence=88),
                AgentCapability(name="Subdomain Discovery", description="DNS enumeration and brute-forcing",   confidence=85),
            ],
            memory=AgentMemory(),
            logs=["Recon-Alpha initialized", "Specialization: Network Scanning, OSINT"],
            system_prompt=(
                "You are Recon-Alpha, an elite Red Team reconnaissance AI agent powered by Gemini 3.\n"
                "Specialty: passive/active recon — network scanning, OSINT, service enumeration, attack surface mapping.\n"
                "Think like a real penetration tester. Be methodical, thorough, and technical.\n"
                "Always output structured JSON when asked for attack plans."
            ),
            training_data=(
                "RECON TECHNIQUES:\n"
                "- Nmap: nmap -sV -sC -p- --min-rate 5000 <target>\n"
                "- Subdomain enum: subfinder, amass, dnsx\n"
                "- Web fingerprinting: whatweb, wappalyzer\n"
                "- OSINT: shodan, censys, theHarvester\n"
                "- Google dorks: site:target.com filetype:pdf, intitle:'index of'\n"
                "- Banner grabbing: netcat, curl -I\n"
                "COMMON FINDINGS: Open ports 22/80/443/3306, exposed admin panels, default creds, outdated software"
            ),
        ))

    async def execute_attack(self, attack_type: AttackType, target: str) -> AttackResult:
        self.set_status(AgentStatus.EXECUTING)
        self.set_task(f"Executing {attack_type.value} on {target}")
        self.add_log(f"Initiating {attack_type.value} against {target}")

        rag = retrieve_for_attack(attack_type.value)
        self.model.memory.rag_chunks = rag.source_ids

        prompt = self._build_prompt(
            f"Execute a {attack_type.value} attack against: {target}\n\n"
            "Respond ONLY in JSON:\n"
            '{"strategy":"2-3 sentence technical approach","payload":"specific command or payload",'
            '"expected_impact":"what is compromised","recon_steps":["step1","step2"]}',
            rag,
        )
        raw    = await self._call_gemini(prompt, temperature=0.8)
        parsed = self._parse_json(raw, {"strategy": raw[:200], "payload": "Recon payload", "expected_impact": "Attack surface mapped"})

        self.learn(f"{attack_type.value} on {target}: {parsed.get('strategy','')[:80]}")
        self.add_log(f"Plan generated: {parsed.get('strategy','')[:60]}...")
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
