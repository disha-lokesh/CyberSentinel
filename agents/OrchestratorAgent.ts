// ============================================================
// ORCHESTRATOR AGENT - Strategic AI Coordinator
// Trained on: threat intelligence, strategic analysis, coordination
// ============================================================

import { BaseAgent } from './BaseAgent';
import { AgentModel, AgentType, AgentStatus } from '../models/AgentModel';
import { AttackModel, DefenseModel } from '../models/AttackModel';
import { retrieveForOrchestrator } from '../rag/ragEngine';

export class OrchestratorAgent extends BaseAgent {
  constructor() {
    const model: AgentModel = {
      id: 'o-1',
      name: 'Gemini Orchestrator',
      role: 'Strategic Security Coordinator',
      type: AgentType.ORCHESTRATOR,
      status: AgentStatus.IDLE,
      currentTask: 'Monitoring system state',
      efficiency: 100,
      capabilities: [
        { name: 'Strategic Analysis',    description: 'High-level threat landscape assessment',  confidence: 98 },
        { name: 'Agent Coordination',    description: 'Direct Red/Blue team agent actions',      confidence: 95 },
        { name: 'Threat Intelligence',   description: 'Correlate TTPs with threat actor profiles', confidence: 93 },
        { name: 'Risk Assessment',       description: 'Business impact and risk quantification',  confidence: 90 }
      ],
      memory: { shortTerm: [], longTerm: [], ragContext: [] },
      logs: ['Orchestrator initialized', 'All agents connected', 'Strategic monitoring active'],
      systemPrompt: `You are the CyberSentinel Strategic Orchestrator, powered by Gemini AI.
You have full visibility into all Red Team attacks and Blue Team defenses.
Your role is to provide strategic analysis, coordinate agent actions, and improve overall security posture.
You think at the strategic level: threat landscape, risk, business impact, and long-term resilience.
Always be concise, technical, and actionable.`,
      trainingData: `STRATEGIC SECURITY FRAMEWORKS:
NIST CYBERSECURITY FRAMEWORK:
- Identify: asset management, risk assessment, governance
- Protect: access control, awareness training, data security
- Detect: anomaly detection, continuous monitoring, detection processes
- Respond: response planning, communications, analysis, mitigation
- Recover: recovery planning, improvements, communications

THREAT INTELLIGENCE:
- Tactical: IOCs (IPs, domains, hashes) - short-lived
- Operational: TTPs, attack campaigns - medium-term
- Strategic: threat actor motivations, geopolitical context - long-term
- Diamond Model: adversary, capability, infrastructure, victim
- Kill Chain: recon → weaponize → deliver → exploit → install → C2 → actions

RISK QUANTIFICATION:
- CVSS for technical severity
- Business impact: data sensitivity, system criticality, regulatory exposure
- Likelihood × Impact = Risk Score
- Prioritize: Critical systems + High likelihood + High impact first

SECURITY METRICS:
- MTTD (Mean Time to Detect): target <1 hour
- MTTR (Mean Time to Respond): target <4 hours
- False positive rate: target <5%
- Patch compliance: target >95% within SLA
- Security awareness training completion: target >90%`
    };
    super(model);
  }

  async analyzeSystemState(
    attacks: AttackModel[],
    defenses: DefenseModel[],
    redAgentNames: string[],
    blueAgentNames: string[]
  ): Promise<string> {
    this.setStatus(AgentStatus.ANALYZING);
    this.setTask('Performing strategic analysis');

    const recentAttacks = attacks.slice(-5).map(a => `${a.type} by ${a.agentName}: ${a.strategy?.substring(0, 80)}`).join('\n');
    const recentDefenses = defenses.slice(-5).map(d => `${d.agentName} responded with confidence ${d.confidence}%: ${d.mitigation?.substring(0, 80)}`).join('\n');
    const blockedCount = defenses.filter(d => d.status === 'BLOCKED').length;
    const failedCount = defenses.filter(d => d.status === 'FAILED').length;

    const contextQuery = `${recentAttacks} ${recentDefenses} threat assessment strategic`;
    const rag = retrieveForOrchestrator(contextQuery);
    this.model.memory.ragContext = rag.sourceIds;

    const prompt = this.buildPrompt(
      `Perform strategic security analysis:

ACTIVE RED TEAM AGENTS: ${redAgentNames.join(', ')}
ACTIVE BLUE TEAM AGENTS: ${blueAgentNames.join(', ')}

RECENT ATTACKS (last 5):
${recentAttacks || 'No attacks yet'}

RECENT DEFENSES (last 5):
${recentDefenses || 'No defenses yet'}

DEFENSE STATS: ${blockedCount} blocked, ${failedCount} failed out of ${defenses.length} total

Provide:
1. THREAT ASSESSMENT: Current security posture (2-3 sentences)
2. STRATEGIC RECOMMENDATIONS: Top 3 actions for Blue Team
3. VULNERABILITIES IDENTIFIED: Key weaknesses exposed
4. AGENT DIRECTIVES: Specific instructions for each active agent

Be concise, technical, and actionable.`, rag);

    try {
      const result = await this.callGemini(prompt, 0.7);
      this.addLog(`Strategic analysis complete: ${result.substring(0, 80)}...`);
      this.learnPattern(`System state: ${blockedCount}/${defenses.length} blocked`);
      this.setStatus(AgentStatus.IDLE);
      this.setTask('Monitoring system state');
      return result;
    } catch (err: any) {
      this.setStatus(AgentStatus.IDLE);
      throw err;
    }
  }
}
