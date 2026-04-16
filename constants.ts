// ============================================================
// CONSTANTS - Uses AgentRegistry for trained agent instances
// ============================================================

import { getAgentSnapshots } from './agents/AgentRegistry';
import { AgentType }         from './models/AgentModel';
import { AttackType }        from './models/AttackModel';

export const INITIAL_RED_AGENTS  = getAgentSnapshots(AgentType.RED);
export const INITIAL_BLUE_AGENTS = getAgentSnapshots(AgentType.BLUE);

export const ATTACK_DESCRIPTIONS: Record<AttackType, string> = {
  [AttackType.SQL_INJECTION]:         'Inject malicious SQL to bypass auth or extract data',
  [AttackType.XSS]:                   'Inject client-side scripts to steal sessions or cookies',
  [AttackType.BRUTE_FORCE]:           'Systematically crack passwords via dictionary/hybrid attacks',
  [AttackType.PHISHING]:              'Social engineering to harvest credentials via fake pages',
  [AttackType.RANSOMWARE]:            'Simulate AES-256 file encryption and ransom demand',
  [AttackType.DDOS]:                  'Overwhelm target with volumetric or application-layer traffic',
  [AttackType.PRIVILEGE_ESCALATION]:  'Exploit SUID/sudo/kernel bugs to gain root/admin access',
  [AttackType.DATA_EXFILTRATION]:     'Covertly extract sensitive data via DNS tunneling or HTTPS'
};
