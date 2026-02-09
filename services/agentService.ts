import { Agent, AgentStatus, AgentType, LogEntry } from '../types';
import { generateRedTeamAttack, generateBlueTeamResponse } from './geminiService';

// Attack Types for Red Team
export enum AttackType {
  SQL_INJECTION = 'SQL Injection',
  XSS = 'Cross-Site Scripting',
  BRUTE_FORCE = 'Brute Force',
  PHISHING = 'Phishing Campaign',
  RANSOMWARE = 'Ransomware Simulation',
  DDoS = 'DDoS Attack',
  PRIVILEGE_ESCALATION = 'Privilege Escalation',
  DATA_EXFILTRATION = 'Data Exfiltration'
}

export interface AttackResult {
  id: string;
  type: AttackType;
  agentId: string;
  timestamp: number;
  strategy: string;
  payload: string;
  expectedImpact: string;
  status: 'INITIATED' | 'IN_PROGRESS' | 'DETECTED' | 'BLOCKED' | 'SUCCESS';
  logs: string[];
}

export interface DefenseResult {
  id: string;
  attackId: string;
  agentId: string;
  timestamp: number;
  analysis: string;
  mitigation: string;
  confidence: number;
  status: 'ANALYZING' | 'MITIGATING' | 'BLOCKED' | 'FAILED';
}

// Red Team Attack Execution
export const executeRedTeamAttack = async (
  attackType: AttackType,
  agent: Agent,
  target: string = 'Enterprise Web Application'
): Promise<AttackResult> => {
  
  const attackId = `attack-${Date.now()}`;
  
  // Generate attack using Gemini
  const attackPlan = await generateRedTeamAttack(attackType, target);
  
  const result: AttackResult = {
    id: attackId,
    type: attackType,
    agentId: agent.id,
    timestamp: Date.now(),
    strategy: attackPlan.strategy,
    payload: attackPlan.payload,
    expectedImpact: attackPlan.expectedImpact,
    status: 'INITIATED',
    logs: [
      `[${new Date().toLocaleTimeString()}] Attack initiated by ${agent.name}`,
      `[${new Date().toLocaleTimeString()}] Strategy: ${attackPlan.strategy}`,
      `[${new Date().toLocaleTimeString()}] Payload generated: ${attackPlan.payload.substring(0, 50)}...`
    ]
  };
  
  return result;
};

// Blue Team Automated Response
export const executeBlueTeamDefense = async (
  attack: AttackResult,
  agent: Agent
): Promise<DefenseResult> => {
  
  const defenseId = `defense-${Date.now()}`;
  
  // Analyze threat using Gemini
  const threatInfo = `${attack.type} attack detected. Strategy: ${attack.strategy}. Payload: ${attack.payload}`;
  const defense = await generateBlueTeamResponse(attack.type, threatInfo);
  
  const result: DefenseResult = {
    id: defenseId,
    attackId: attack.id,
    agentId: agent.id,
    timestamp: Date.now(),
    analysis: defense.analysis,
    mitigation: defense.mitigation,
    confidence: defense.confidence,
    status: 'ANALYZING'
  };
  
  return result;
};

// Simulate attack progression
export const progressAttack = (attack: AttackResult): AttackResult => {
  const statuses: AttackResult['status'][] = ['INITIATED', 'IN_PROGRESS', 'DETECTED'];
  const currentIndex = statuses.indexOf(attack.status);
  
  if (currentIndex < statuses.length - 1) {
    return {
      ...attack,
      status: statuses[currentIndex + 1],
      logs: [
        ...attack.logs,
        `[${new Date().toLocaleTimeString()}] Status: ${statuses[currentIndex + 1]}`
      ]
    };
  }
  
  return attack;
};

// Simulate defense progression
export const progressDefense = (defense: DefenseResult, success: boolean): DefenseResult => {
  if (defense.status === 'ANALYZING') {
    return { ...defense, status: 'MITIGATING' };
  }
  
  if (defense.status === 'MITIGATING') {
    return { 
      ...defense, 
      status: success ? 'BLOCKED' : 'FAILED'
    };
  }
  
  return defense;
};

// Create specialized agents with training
export const createTrainedAgent = (
  id: string,
  name: string,
  role: string,
  type: AgentType,
  specialization: string[]
): Agent => {
  return {
    id,
    name,
    role,
    type,
    status: AgentStatus.IDLE,
    currentTask: 'Awaiting orders',
    efficiency: 85 + Math.floor(Math.random() * 15), // 85-100%
    logs: [
      `Agent ${name} initialized`,
      `Specialization: ${specialization.join(', ')}`,
      `Training complete - Ready for deployment`
    ]
  };
};
