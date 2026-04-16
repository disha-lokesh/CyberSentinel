// ============================================================
// GEMINI SERVICE - Thin wrapper, now delegates to agent classes
// Kept for backward compatibility with OrchestratorView
// ============================================================

import { orchestratorAgent } from '../agents/AgentRegistry';
import { AttackModel, DefenseModel } from '../models/AttackModel';

export const isGeminiAvailable = (): boolean => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  return apiKey !== '' && apiKey !== 'YOUR_API_KEY_HERE';
};

export const generateStrategicDecision = async (
  attacks: AttackModel[],
  defenses: DefenseModel[],
  redAgentNames: string[],
  blueAgentNames: string[]
): Promise<string> => {
  if (!isGeminiAvailable()) {
    return '⚠️ Set VITE_GEMINI_API_KEY in .env.local to enable AI-powered strategic analysis.';
  }
  try {
    return await orchestratorAgent.analyzeSystemState(attacks, defenses, redAgentNames, blueAgentNames);
  } catch (err: any) {
    return `⚠️ Orchestrator error: ${err.message}`;
  }
};
