// ============================================================
// AGENT REGISTRY
// Singleton registry that holds all agent instances.
// Views import from here instead of instantiating directly.
// ============================================================

import { ReconAgent }          from './red/ReconAgent';
import { ExploitAgent }        from './red/ExploitAgent';
import { SocialEngineerAgent } from './red/SocialEngineerAgent';
import { CryptoAgent }         from './red/CryptoAgent';
import { SentinelAgent }       from './blue/SentinelAgent';
import { GuardianAgent }       from './blue/GuardianAgent';
import { ForensicAgent }       from './blue/ForensicAgent';
import { PatchAgent }          from './blue/PatchAgent';
import { OrchestratorAgent }   from './OrchestratorAgent';
import { AttackType }          from '../models/AttackModel';
import { AgentType }           from '../models/AgentModel';

// ── Instantiate all agents ────────────────────────────────────
export const reconAgent          = new ReconAgent();
export const exploitAgent        = new ExploitAgent();
export const socialEngineerAgent = new SocialEngineerAgent();
export const cryptoAgent         = new CryptoAgent();

export const sentinelAgent  = new SentinelAgent();
export const guardianAgent  = new GuardianAgent();
export const forensicAgent  = new ForensicAgent();
export const patchAgent     = new PatchAgent();

export const orchestratorAgent = new OrchestratorAgent();

// ── Agent lists ───────────────────────────────────────────────
export const RED_AGENTS  = [reconAgent, exploitAgent, socialEngineerAgent, cryptoAgent];
export const BLUE_AGENTS = [sentinelAgent, guardianAgent, forensicAgent, patchAgent];

// ── Attack type → best Red Team agent mapping ─────────────────
export const ATTACK_AGENT_MAP: Record<AttackType, typeof reconAgent> = {
  [AttackType.SQL_INJECTION]:        exploitAgent,
  [AttackType.XSS]:                  exploitAgent,
  [AttackType.BRUTE_FORCE]:          cryptoAgent,
  [AttackType.PHISHING]:             socialEngineerAgent,
  [AttackType.RANSOMWARE]:           exploitAgent,
  [AttackType.DDOS]:                 cryptoAgent,
  [AttackType.PRIVILEGE_ESCALATION]: exploitAgent,
  [AttackType.DATA_EXFILTRATION]:    cryptoAgent
};

// ── Attack type → best Blue Team agent mapping ────────────────
export const DEFENSE_AGENT_MAP: Record<AttackType, typeof sentinelAgent> = {
  [AttackType.SQL_INJECTION]:        sentinelAgent,
  [AttackType.XSS]:                  guardianAgent,
  [AttackType.BRUTE_FORCE]:          guardianAgent,
  [AttackType.PHISHING]:             forensicAgent,
  [AttackType.RANSOMWARE]:           forensicAgent,
  [AttackType.DDOS]:                 guardianAgent,
  [AttackType.PRIVILEGE_ESCALATION]: patchAgent,
  [AttackType.DATA_EXFILTRATION]:    sentinelAgent
};

// ── Get agent snapshot for UI ─────────────────────────────────
export function getAgentSnapshots(type: AgentType) {
  const agents = type === AgentType.RED ? RED_AGENTS : BLUE_AGENTS;
  return agents.map(a => a.getSnapshot());
}
