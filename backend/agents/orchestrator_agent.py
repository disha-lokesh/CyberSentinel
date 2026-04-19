"""
Orchestrator Agent — Strategic AI coordinator.
Uses Gemini 3.1 Pro Preview for deep reasoning.
"""
from __future__ import annotations
import uuid
from backend.agents.base_agent import BaseAgent, ORCHESTRATOR_MODEL
from backend.models.schemas import (
    AgentModel, AgentType, AgentStatus, AgentCapability, AgentMemory,
    AttackResult, DefenseResult, OrchestratorDecision,
)
from backend.rag.rag_engine import retrieve_for_orchestrator


class OrchestratorAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentModel(
            id="o-1", name="Gemini Orchestrator",
            role="Strategic Security Coordinator",
            type=AgentType.ORCHESTRATOR, efficiency=100,
            current_task="Monitoring system state",
            capabilities=[
                AgentCapability(name="Strategic Analysis",  description="High-level threat landscape assessment",   confidence=98),
                AgentCapability(name="Agent Coordination",  description="Direct Red/Blue team agent actions",       confidence=95),
                AgentCapability(name="Threat Intelligence", description="Correlate TTPs with threat actor profiles", confidence=93),
                AgentCapability(name="Risk Assessment",     description="Business impact and risk quantification",   confidence=90),
            ],
            memory=AgentMemory(),
            logs=["Orchestrator initialized", "All agents connected", "Strategic monitoring active"],
            system_prompt=(
                "You are the CyberSentinel Strategic Orchestrator, powered by Gemini 3.1 Pro.\n"
                "You have full visibility into all Red Team attacks and Blue Team defenses.\n"
                "Provide strategic analysis, coordinate agent actions, and improve security posture.\n"
                "Think at the strategic level: threat landscape, risk, business impact, long-term resilience."
            ),
            training_data=(
                "STRATEGIC FRAMEWORKS:\n"
                "NIST CSF: Identify → Protect → Detect → Respond → Recover\n"
                "THREAT INTELLIGENCE:\n"
                "- Tactical: IOCs (IPs, domains, hashes)\n"
                "- Operational: TTPs, attack campaigns\n"
                "- Strategic: threat actor motivations\n"
                "KILL CHAIN: recon → weaponize → deliver → exploit → install → C2 → actions\n"
                "RISK: Likelihood × Impact = Risk Score\n"
                "METRICS: MTTD <1hr, MTTR <4hr, false positive rate <5%"
            ),
        ))

    async def _call_gemini_safe(self, prompt, blocked, failed, total, recent_attacks, recent_defenses) -> str:
        """Try Gemini, fall back to data-driven analysis if API unavailable."""
        try:
            return await self._call_gemini(prompt, temperature=0.7, model=ORCHESTRATOR_MODEL)
        except Exception as e:
            import logging
            logging.getLogger("orchestrator").warning(f"Gemini unavailable: {e.__class__.__name__}, using data-driven fallback")
            return self._build_fallback_analysis(blocked, failed, total, recent_attacks, recent_defenses)

    def _build_fallback_analysis(self, blocked, failed, total, recent_attacks, recent_defenses) -> str:
        """Generate a realistic analysis from actual attack/defense data without Gemini."""
        rate = round(blocked / total * 100) if total else 0
        severity = "CRITICAL" if failed > 2 else "HIGH" if failed > 0 else "MEDIUM" if total > 5 else "LOW"
        posture = (
            f"System is under active attack with {total} incidents recorded. "
            f"Blue Team has blocked {blocked}/{total} attacks ({rate}% success rate). "
            f"{'CRITICAL: {failed} attacks succeeded — immediate escalation required.' if failed > 0 else 'All detected attacks have been successfully mitigated.'}"
        )
        recs = [
            f"Increase monitoring frequency — {total} attacks detected in current session",
            f"{'Investigate {failed} successful attacks for lateral movement' if failed > 0 else 'Maintain current WAF and SIEM rule effectiveness'}",
            "Run Gemini Orchestrator analysis by adding a valid GEMINI_API_KEY to backend/.env",
        ]
        vulns = [
            "API key not configured — Gemini AI analysis unavailable",
            f"{'Active breach detected — {failed} unmitigated attacks' if failed > 0 else 'No active breaches detected'}",
        ]
        import json
        return json.dumps({
            "threat_assessment": posture,
            "recommendations": recs,
            "vulnerabilities": vulns,
            "agent_directives": {
                "Sentinel-AI": f"Maintain SIEM monitoring — {total} events logged",
                "Guardian-Firewall": f"WAF blocking at {rate}% efficiency",
            }
        })

    async def analyze_system_state(
        self,
        attacks:          list[AttackResult],
        defenses:         list[DefenseResult],
        red_agent_names:  list[str],
        blue_agent_names: list[str],
    ) -> OrchestratorDecision:
        self.set_status(AgentStatus.ANALYZING)
        self.set_task("Performing strategic analysis")

        recent_attacks  = "\n".join(f"- {a.type.value} by {a.agent_name}: {a.strategy[:80]}" for a in attacks[-5:]) or "No attacks yet"
        recent_defenses = "\n".join(f"- {d.agent_name} (conf {d.confidence}%): {d.mitigation[:80]}" for d in defenses[-5:]) or "No defenses yet"
        blocked = sum(1 for d in defenses if d.status.value == "BLOCKED")
        failed  = sum(1 for d in defenses if d.status.value == "FAILED")

        rag = retrieve_for_orchestrator(f"{recent_attacks} {recent_defenses}")
        self.model.memory.rag_chunks = rag.source_ids

        prompt = self._build_prompt(
            f"Perform strategic security analysis:\n\n"
            f"RED TEAM AGENTS: {', '.join(red_agent_names)}\n"
            f"BLUE TEAM AGENTS: {', '.join(blue_agent_names)}\n\n"
            f"RECENT ATTACKS:\n{recent_attacks}\n\n"
            f"RECENT DEFENSES:\n{recent_defenses}\n\n"
            f"STATS: {blocked} blocked, {failed} failed of {len(defenses)} total\n\n"
            "Respond ONLY in JSON:\n"
            '{"threat_assessment":"current security posture (2-3 sentences)",'
            '"recommendations":["action1","action2","action3"],'
            '"vulnerabilities":["weakness1","weakness2"],'
            '"agent_directives":{"Sentinel-AI":"directive","Guardian-Firewall":"directive"}}',
            rag,
        )
        raw    = await self._call_gemini_safe(prompt, blocked, failed, len(defenses), recent_attacks, recent_defenses)
        parsed = self._parse_json(raw, {
            "threat_assessment": raw[:300] if raw else "Analysis unavailable",
            "recommendations": ["Review attack patterns", "Strengthen defenses"],
            "vulnerabilities": ["Unknown"],
        })

        self.learn(f"System state: {blocked}/{len(defenses)} blocked")
        self.add_log(f"Strategic analysis complete")
        self.set_status(AgentStatus.IDLE)
        self.set_task("Monitoring system state")

        return OrchestratorDecision(
            threat_assessment=parsed.get("threat_assessment", ""),
            recommendations=parsed.get("recommendations", []),
            vulnerabilities=parsed.get("vulnerabilities", []),
            agent_directives=parsed.get("agent_directives", {}),
            rag_sources_used=rag.source_ids,
        )
