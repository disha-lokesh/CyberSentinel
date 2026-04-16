"""Crypto-Breaker — Brute force, hash cracking, DDoS, data exfiltration."""
from __future__ import annotations
import uuid
from backend.agents.base_agent import BaseAgent
from backend.models.schemas import (
    AgentModel, AgentType, AgentStatus, AgentCapability, AgentMemory,
    AttackResult, AttackType, AttackStatus,
)
from backend.rag.rag_engine import retrieve_for_attack


class CryptoAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentModel(
            id="r-4", name="Crypto-Breaker",
            role="Cryptanalysis & Network Attack Expert",
            type=AgentType.RED, efficiency=89,
            capabilities=[
                AgentCapability(name="Brute Force",       description="Dictionary and hybrid password attacks", confidence=95),
                AgentCapability(name="Hash Cracking",     description="MD5, SHA1, NTLM, bcrypt cracking",       confidence=90),
                AgentCapability(name="DDoS",              description="Volumetric and application layer floods", confidence=87),
                AgentCapability(name="Data Exfiltration", description="Covert channel data theft",              confidence=85),
            ],
            memory=AgentMemory(),
            logs=["Crypto-Breaker initialized", "Specialization: Brute Force, Hash Cracking, DDoS, Data Exfiltration"],
            system_prompt=(
                "You are Crypto-Breaker, an elite Red Team cryptanalysis and network attack AI agent powered by Gemini 3.\n"
                "Specialty: credential attacks (brute force, hash cracking), DDoS, covert data exfiltration.\n"
                "Always output structured JSON when asked for attack plans."
            ),
            training_data=(
                "BRUTE FORCE & HASH CRACKING:\n"
                "- Hydra: hydra -l admin -P rockyou.txt ssh://target\n"
                "- Hashcat: hashcat -m 1000 hashes.txt rockyou.txt (NTLM)\n"
                "- Password spraying: 1 password across many accounts\n"
                "DDoS TECHNIQUES:\n"
                "- HTTP Flood: 100k GET requests/sec to /search endpoint\n"
                "- Slowloris: keep connections open with partial HTTP headers\n"
                "- SYN Flood: half-open TCP connections\n"
                "DATA EXFILTRATION:\n"
                "- DNS tunneling: iodine, dnscat2\n"
                "- HTTPS to attacker C2\n"
                "- ICMP covert channel"
            ),
        ))

    async def execute_attack(self, attack_type: AttackType, target: str) -> AttackResult:
        self.set_status(AgentStatus.EXECUTING)
        self.set_task(f"Executing {attack_type.value} against {target}")
        self.add_log(f"Launching {attack_type.value} attack on {target}")

        rag = retrieve_for_attack(attack_type.value)
        self.model.memory.rag_chunks = rag.source_ids

        prompt = self._build_prompt(
            f"Execute a {attack_type.value} attack against: {target}\n\n"
            "Respond ONLY in JSON:\n"
            '{"strategy":"2-3 sentence technical approach",'
            '"payload":"specific command, tool syntax, or attack config",'
            '"expected_impact":"service disruption, credentials, or data stolen",'
            '"tools_used":["tool1","tool2"],'
            '"detection_risk":"LOW/MEDIUM/HIGH and why"}',
            rag,
        )
        raw    = await self._call_gemini(prompt, temperature=0.8)
        parsed = self._parse_json(raw, {"strategy": raw[:200], "payload": "Attack configured", "expected_impact": "Target compromised"})

        self.learn(f"{attack_type.value}: {parsed.get('strategy','')[:80]}")
        self.add_log(f"Attack configured: {parsed.get('payload','')[:60]}...")
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
