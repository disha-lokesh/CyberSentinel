// ============================================================
// TYPES - Re-exports from models layer for backward compatibility
// ============================================================

export { AgentType, AgentStatus }    from './models/AgentModel';
export type { AgentModel as Agent }  from './models/AgentModel';
export type { LogEntry, MetricData, ThreatModel as Threat } from './models/ThreatModel';
export type { AttackModel, DefenseModel } from './models/AttackModel';
export { AttackType }                from './models/AttackModel';

// Legacy MCPTool / WorkflowNode types kept for WorkflowView
export interface MCPTool {
  name: string;
  description: string;
  parameters: any;
}

export interface WorkflowNode {
  id: string;
  type: 'AGENT' | 'TOOL' | 'DATA';
  label: string;
  subLabel?: string;
  status: 'idle' | 'running' | 'success' | 'error';
  x: number;
  y: number;
  agentId?: string;
  icon?: any;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
}

export interface WorkflowEvent {
  id: string;
  timestamp: number;
  nodeId: string;
  type: 'INPUT' | 'OUTPUT' | 'THOUGHT' | 'TOOL_CALL';
  content: string;
}
