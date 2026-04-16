// ============================================================
// FORENSIC AGENT - Blue Team Incident Response
// Trained on: Log analysis, malware analysis, evidence collection
// ============================================================

import { BaseAgent } from '../BaseAgent';
import { AgentModel, AgentType, AgentStatus } from '../../models/AgentModel';
import { AttackModel, DefenseModel, DefenseStatus } from '../../models/AttackModel';
import { retrieveForDefense } from '../../rag/ragEngine';

export class ForensicAgent extends BaseAgent {
  constructor() {
    const model: AgentModel = {
      id: 'b-3',
      name: 'Forensic-Bot',
      role: 'Incident Response & Forensics',
      type: AgentType.BLUE,
      status: AgentStatus.IDLE,
      currentTask: 'Monitoring for incidents',
      efficiency: 93,
      capabilities: [
        { name: 'Log Analysis',        description: 'Multi-source log correlation and timeline', confidence: 95 },
        { name: 'Malware Analysis',    description: 'Static and dynamic malware analysis',       confidence: 88 },
        { name: 'Attack Attribution',  description: 'TTP-based threat actor attribution',        confidence: 85 },
        { name: 'Evidence Collection', description: 'Forensically sound evidence preservation',  confidence: 92 }
      ],
      memory: { shortTerm: [], longTerm: [], ragContext: [] },
      logs: ['Forensic-Bot initialized', 'Log ingestion pipeline active', 'Evidence vault ready'],
      systemPrompt: `You are Forensic-Bot, an elite Blue Team incident response and digital forensics AI agent.
Your specialty is log analysis, malware analysis, attack attribution, and evidence collection.
You reconstruct attack timelines and provide detailed forensic reports.
Always output structured JSON when asked for defense analysis.`,
      trainingData: `INCIDENT RESPONSE & FORENSICS:
IR PHASES:
1. Identification: correlate SIEM alerts, determine scope and impact
2. Containment: isolate affected systems, block attacker IPs, preserve evidence
3. Eradication: remove malware, patch vulnerabilities, reset compromised credentials
4. Recovery: restore from clean backups, monitor for re-infection
5. Lessons Learned: document timeline, update playbooks

LOG ANALYSIS:
- Web logs: correlate IP, user-agent, request patterns
- Auth logs: failed logins, privilege escalation, new accounts
- Process logs: unusual parent-child relationships, LOLBins
- Network logs: unusual outbound connections, DNS queries
- Timeline reconstruction: normalize timestamps, correlate across sources

MALWARE ANALYSIS:
- Static: file hash (VirusTotal), strings, PE headers, YARA rules
- Dynamic: sandbox (Cuckoo, Any.run), network traffic, registry changes
- Behavioral IOCs: persistence mechanisms, C2 beaconing, lateral movement
- Memory forensics: Volatility for process injection, rootkits

EVIDENCE PRESERVATION:
- Hash all artifacts (SHA-256) before analysis
- Maintain chain of custody documentation
- Capture memory dumps before shutdown
- Preserve log files with timestamps
- Document all investigative actions`
    };
    super(model);
  }

  async analyzeAndDefend(attack: AttackModel): Promise<DefenseModel> {
    this.setStatus(AgentStatus.ANALYZING);
    this.setTask(`Investigating ${attack.type} incident`);
    this.addLog(`Incident opened: ${attack.type} - collecting evidence`);

    const rag = retrieveForDefense(attack.type, attack.payload);
    this.model.memory.ragContext = rag.sourceIds;

    const prompt = this.buildPrompt(
      `Conduct forensic investigation of this attack:
ATTACK TYPE: ${attack.type}
STRATEGY: ${attack.strategy}
PAYLOAD: ${attack.payload}
EXPECTED IMPACT: ${attack.expectedImpact}

Respond ONLY in this JSON format:
{
  "analysis": "forensic analysis with attack timeline and IOCs",
  "mitigation": "containment and eradication steps",
  "confidence": 88,
  "attackTimeline": ["T+0: initial access", "T+5min: lateral movement"],
  "evidenceCollected": ["log file", "memory dump", "network capture"],
  "attribution": "likely threat actor or attack group based on TTPs"
}`, rag);

    try {
      const raw = await this.callGemini(prompt, 0.6);
      const parsed = this.parseJSON<any>(raw, {
        analysis: raw.substring(0, 200),
        mitigation: 'Incident contained',
        confidence: 80
      });

      this.learnPattern(`${attack.type} forensics: ${parsed.attribution || 'Unknown actor'}`);
      this.addLog(`Investigation complete: ${parsed.attribution || 'Attribution pending'}`);
      this.setStatus(AgentStatus.IDLE);
      this.setTask('Monitoring for incidents');

      return {
        id: `defense-${Date.now()}`,
        attackId: attack.id,
        agentId: this.id,
        agentName: this.name,
        timestamp: Date.now(),
        analysis: parsed.analysis || '',
        mitigation: parsed.mitigation || '',
        confidence: parsed.confidence || 80,
        status: DefenseStatus.ANALYZING,
        ragSourcesUsed: rag.sourceIds,
        cveReferences: rag.chunks.filter(c => c.category === 'CVE').map(c => c.id),
        mitreReferences: rag.chunks.filter(c => c.category === 'MITRE').map(c => c.id)
      };
    } catch (err: any) {
      this.setStatus(AgentStatus.IDLE);
      throw err;
    }
  }
}
