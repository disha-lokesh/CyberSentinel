// ============================================================
// AGENT MODEL - Core data structures for all agent types
// ============================================================

export enum AgentType {
  RED = 'RED',
  BLUE = 'BLUE',
  ORCHESTRATOR = 'ORCHESTRATOR'
}

export enum AgentStatus {
  IDLE = 'IDLE',
  PLANNING = 'PLANNING',
  EXECUTING = 'EXECUTING',
  ANALYZING = 'ANALYZING',
  MITIGATING = 'MITIGATING',
  WAITING = 'WAITING'
}

export interface AgentCapability {
  name: string;
  description: string;
  attackTypes?: string[];   // for red agents
  defenseTypes?: string[];  // for blue agents
  confidence: number;       // 0-100 proficiency
}

export interface AgentMemory {
  shortTerm: string[];      // last N actions
  longTerm: string[];       // persistent learned patterns
  ragContext: string[];     // retrieved knowledge chunks
}

export interface AgentModel {
  id: string;
  name: string;
  role: string;
  type: AgentType;
  status: AgentStatus;
  currentTask: string;
  efficiency: number;
  capabilities: AgentCapability[];
  memory: AgentMemory;
  logs: string[];
  systemPrompt: string;     // agent-specific Gemini system prompt
  trainingData: string;     // domain knowledge injected into context
}
