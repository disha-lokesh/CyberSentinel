// ============================================================
// AGENT SERVICE - Orchestrates attack/defense execution
// Delegates to typed agent classes via AgentRegistry
// ============================================================

import { ATTACK_AGENT_MAP, DEFENSE_AGENT_MAP } from '../agents/AgentRegistry';
import { AttackModel, AttackType, AttackStatus, DefenseModel, DefenseStatus } from '../models/AttackModel';

export { AttackType, AttackStatus, DefenseStatus };
export type { AttackModel, DefenseModel };

// ── Execute a Red Team attack ─────────────────────────────────
export const executeRedTeamAttack = async (
  attackType: AttackType,
  target = 'Enterprise Web Application'
): Promise<AttackModel> => {
  const agent = ATTACK_AGENT_MAP[attackType];
  return agent.executeAttack(attackType, target);
};

// ── Execute Blue Team defense (auto-triggered) ────────────────
export const executeBlueTeamDefense = async (
  attack: AttackModel
): Promise<DefenseModel> => {
  const agent = DEFENSE_AGENT_MAP[attack.type];
  return agent.analyzeAndDefend(attack);
};

// ── Progress attack through status stages ────────────────────
export const progressAttack = (attack: AttackModel): AttackModel => {
  const flow: AttackModel['status'][] = [
    AttackStatus.INITIATED,
    AttackStatus.IN_PROGRESS,
    AttackStatus.DETECTED
  ];
  const idx = flow.indexOf(attack.status);
  if (idx < flow.length - 1) {
    return {
      ...attack,
      status: flow[idx + 1],
      logs: [...attack.logs, `[${new Date().toLocaleTimeString()}] Status → ${flow[idx + 1]}`]
    };
  }
  return attack;
};

// ── Progress defense through status stages ───────────────────
export const progressDefense = (defense: DefenseModel, success: boolean): DefenseModel => {
  if (defense.status === DefenseStatus.ANALYZING) {
    return { ...defense, status: DefenseStatus.MITIGATING };
  }
  if (defense.status === DefenseStatus.MITIGATING) {
    return { ...defense, status: success ? DefenseStatus.BLOCKED : DefenseStatus.FAILED };
  }
  return defense;
};
