// ============================================================
// RECON AGENT - Red Team Reconnaissance Specialist
// Trained on: OSINT, network scanning, service enumeration
// ============================================================

import { BaseAgent } from '../BaseAgent';
import { AgentModel, AgentType, AgentStatus } from '../../models/AgentModel';
import { AttackModel, AttackType, AttackStatus } from '../../models/AttackModel';
import { retrieveForAttack } from '../../rag/ragEngine';

export class ReconAgent extends BaseAgent {
  constructor() {
    const model: AgentModel = {
      id: 'r-1',
      name: 'Recon-Alpha',
      role: 'Reconnaissance Specialist',
      type: AgentType.RED,
      status: AgentStatus.IDLE,
      currentTask: 'Awaiting orders',
      efficiency: 94,
      capabilities: [
        { name: 'Network Scanning',       description: 'Nmap-style port/service discovery', confidence: 95 },
        { name: 'OSINT',                  description: 'Open-source intelligence gathering',  confidence: 90 },
        { name: 'Service Enumeration',    description: 'Banner grabbing, version detection',  confidence: 88 },
        { name: 'Subdomain Discovery',    description: 'DNS enumeration and brute-forcing',   confidence: 85 }
      ],
      memory: { shortTerm: [], longTerm: [], ragContext: [] },
      logs: ['Recon-Alpha initialized', 'Specialization: Network Scanning, OSINT, Service Enumeration'],
      systemPrompt: `You are Recon-Alpha, an elite Red Team reconnaissance AI agent.
Your specialty is passive and active reconnaissance: network scanning, OSINT, service enumeration, and attack surface mapping.
You think like a real penetration tester. You are methodical, thorough, and technical.
Always output structured JSON when asked for attack plans.`,
      trainingData: `RECON TECHNIQUES:
- Nmap: nmap -sV -sC -p- --min-rate 5000 <target>
- Subdomain enum: subfinder, amass, dnsx
- Web tech fingerprinting: whatweb, wappalyzer
- OSINT: shodan, censys, theHarvester, LinkedIn
- Port scanning: TCP SYN scan, UDP scan, service version detection
- Banner grabbing: netcat, curl -I, telnet
- Google dorks: site:target.com filetype:pdf, intitle:"index of"
COMMON FINDINGS: Open ports 22/80/443/3306/5432, exposed admin panels, default credentials, outdated software versions`
    };
    super(model);
  }

  async executeAttack(attackType: AttackType, target: string): Promise<AttackModel> {
    this.setStatus(AgentStatus.EXECUTING);
    this.setTask(`Executing ${attackType} on ${target}`);
    this.addLog(`Initiating ${attackType} against ${target}`);

    const rag = retrieveForAttack(attackType);
    this.model.memory.ragContext = rag.sourceIds;

    const prompt = this.buildPrompt(
      `Execute a ${attackType} attack against: ${target}
      
Respond ONLY in this JSON format:
{
  "strategy": "2-3 sentence technical attack approach",
  "payload": "specific technical payload or command",
  "expectedImpact": "what this reveals or compromises",
  "reconSteps": ["step1", "step2", "step3"]
}`, rag);

    try {
      const raw = await this.callGemini(prompt, 0.8);
      const parsed = this.parseJSON<any>(raw, {
        strategy: raw.substring(0, 200),
        payload: 'Recon payload generated',
        expectedImpact: 'Attack surface mapped'
      });

      this.learnPattern(`${attackType} on ${target}: ${parsed.strategy?.substring(0, 80)}`);
      this.addLog(`Attack plan generated: ${parsed.strategy?.substring(0, 60)}...`);
      this.setStatus(AgentStatus.IDLE);
      this.setTask('Awaiting orders');

      return {
        id: `attack-${Date.now()}`,
        type: attackType,
        agentId: this.id,
        agentName: this.name,
        timestamp: Date.now(),
        target,
        strategy: parsed.strategy || '',
        payload: parsed.payload || '',
        expectedImpact: parsed.expectedImpact || '',
        status: AttackStatus.INITIATED,
        ragSourcesUsed: rag.sourceIds,
        logs: this.model.logs.slice(0, 5)
      };
    } catch (err: any) {
      this.setStatus(AgentStatus.IDLE);
      throw err;
    }
  }
}
