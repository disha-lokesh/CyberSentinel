// ============================================================
// THREAT MODEL - Threat intelligence data structures
// ============================================================

export type ThreatSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ThreatStatus   = 'ACTIVE' | 'CONTAINED' | 'MITIGATED';

export interface ThreatModel {
  id: string;
  name: string;
  severity: ThreatSeverity;
  status: ThreatStatus;
  vector: string;
  confidence: number;
  attackType?: string;
  detectedAt: number;
  mitigatedAt?: number;
  relatedAttackId?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  level: 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS';
  message: string;
  agentType: 'RED' | 'BLUE' | 'ORCHESTRATOR';
}

export interface MetricData {
  time: string;
  attacks: number;
  blocked: number;
  incidents: number;
}
