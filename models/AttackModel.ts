// ============================================================
// ATTACK MODEL - All attack/defense data structures
// ============================================================

export enum AttackType {
  SQL_INJECTION       = 'SQL Injection',
  XSS                 = 'Cross-Site Scripting',
  BRUTE_FORCE         = 'Brute Force',
  PHISHING            = 'Phishing Campaign',
  RANSOMWARE          = 'Ransomware Simulation',
  DDOS                = 'DDoS Attack',
  PRIVILEGE_ESCALATION = 'Privilege Escalation',
  DATA_EXFILTRATION   = 'Data Exfiltration'
}

export enum AttackStatus {
  INITIATED   = 'INITIATED',
  IN_PROGRESS = 'IN_PROGRESS',
  DETECTED    = 'DETECTED',
  BLOCKED     = 'BLOCKED',
  SUCCESS     = 'SUCCESS'
}

export enum DefenseStatus {
  ANALYZING  = 'ANALYZING',
  MITIGATING = 'MITIGATING',
  BLOCKED    = 'BLOCKED',
  FAILED     = 'FAILED'
}

export interface AttackModel {
  id: string;
  type: AttackType;
  agentId: string;
  agentName: string;
  timestamp: number;
  target: string;
  strategy: string;
  payload: string;
  expectedImpact: string;
  status: AttackStatus;
  ragSourcesUsed: string[];   // which knowledge docs informed this attack
  logs: string[];
}

export interface DefenseModel {
  id: string;
  attackId: string;
  agentId: string;
  agentName: string;
  timestamp: number;
  analysis: string;
  mitigation: string;
  confidence: number;
  status: DefenseStatus;
  ragSourcesUsed: string[];   // which knowledge docs informed this defense
  cveReferences: string[];    // CVEs retrieved from RAG
  mitreReferences: string[];  // MITRE ATT&CK techniques retrieved
}
