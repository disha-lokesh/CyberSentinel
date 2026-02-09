export enum AgentType {
  RED = 'RED',
  BLUE = 'BLUE',
  ORCHESTRATOR = 'ORCHESTRATOR',
  MCP = 'MCP'
}

export enum AgentStatus {
  IDLE = 'IDLE',
  PLANNING = 'PLANNING',
  EXECUTING = 'EXECUTING',
  ANALYZING = 'ANALYZING',
  MITIGATING = 'MITIGATING',
  WAITING = 'WAITING'
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  type: AgentType;
  status: AgentStatus;
  currentTask: string;
  efficiency: number; // 0-100
  logs: string[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  level: 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS';
  message: string;
  type: AgentType;
}

export interface MetricData {
  time: string;
  attacks: number;
  blocked: number;
  incidents: number;
}

export interface Threat {
  id: string;
  name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'CONTAINED' | 'MITIGATED';
  vector: string;
  confidence: number;
}

// --- Workflow & MCP Types ---

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
  data?: any;
  agentId?: string;
  icon?: any;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
  label?: string;
}

export interface WorkflowEvent {
  id: string;
  timestamp: number;
  nodeId: string;
  type: 'INPUT' | 'OUTPUT' | 'THOUGHT' | 'TOOL_CALL';
  content: string;
}