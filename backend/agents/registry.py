"""
Agent Registry — singleton instances of all agents.
Maps attack types to the best agent for each role.
"""
from backend.agents.red.recon_agent    import ReconAgent
from backend.agents.red.exploit_agent  import ExploitAgent
from backend.agents.red.social_agent   import SocialEngineerAgent
from backend.agents.red.crypto_agent   import CryptoAgent
from backend.agents.blue.sentinel_agent import SentinelAgent
from backend.agents.blue.guardian_agent import GuardianAgent
from backend.agents.blue.forensic_agent import ForensicAgent
from backend.agents.blue.patch_agent    import PatchAgent
from backend.agents.orchestrator_agent  import OrchestratorAgent
from backend.models.schemas import AttackType

# ── Singleton instances ───────────────────────────────────────
recon_agent    = ReconAgent()
exploit_agent  = ExploitAgent()
social_agent   = SocialEngineerAgent()
crypto_agent   = CryptoAgent()

sentinel_agent = SentinelAgent()
guardian_agent = GuardianAgent()
forensic_agent = ForensicAgent()
patch_agent    = PatchAgent()

orchestrator   = OrchestratorAgent()

RED_AGENTS  = [recon_agent, exploit_agent, social_agent, crypto_agent]
BLUE_AGENTS = [sentinel_agent, guardian_agent, forensic_agent, patch_agent]

# ── Attack → best Red Team agent ──────────────────────────────
ATTACK_AGENT_MAP = {
    AttackType.SQL_INJECTION:        exploit_agent,
    AttackType.XSS:                  exploit_agent,
    AttackType.BRUTE_FORCE:          crypto_agent,
    AttackType.PHISHING:             social_agent,
    AttackType.RANSOMWARE:           exploit_agent,
    AttackType.DDOS:                 crypto_agent,
    AttackType.PRIVILEGE_ESCALATION: exploit_agent,
    AttackType.DATA_EXFILTRATION:    crypto_agent,
}

# ── Attack → best Blue Team agent ─────────────────────────────
DEFENSE_AGENT_MAP = {
    AttackType.SQL_INJECTION:        sentinel_agent,
    AttackType.XSS:                  guardian_agent,
    AttackType.BRUTE_FORCE:          guardian_agent,
    AttackType.PHISHING:             forensic_agent,
    AttackType.RANSOMWARE:           forensic_agent,
    AttackType.DDOS:                 guardian_agent,
    AttackType.PRIVILEGE_ESCALATION: patch_agent,
    AttackType.DATA_EXFILTRATION:    sentinel_agent,
}
