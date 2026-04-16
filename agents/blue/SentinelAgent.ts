// ============================================================
// SENTINEL AGENT - Blue Team Threat Detection
// Trained on: SIEM, anomaly detection, threat hunting
// ============================================================

import { BaseAgent } from '../BaseAgent';
import { AgentModel, AgentType, AgentStatus } from '../../models/AgentModel';
import { AttackModel, DefenseModel, DefenseStatus } from '../../models/AttackModel';
import { retrieveForDefense } from '../../rag/ragEngine';

export class SentinelAgent extends BaseAgent {
  constructor() {
    const model: AgentModel = {
      id: 'b-1',
      name: 'Sentinel-AI',
      role: 'Threat Detection System',
      type: AgentType.BLUE,
      status: AgentStatus.IDLE,
      currentTask: 'Monitoring for threats',
      efficiency: 96,
      capabilities: [
        { name: 'SIEM Analysis',       description: 'Correlate events across log sources',    confidence: 97 },
        { name: 'Anomaly Detection',   description: 'ML-based behavioral anomaly detection',  confidence: 94 },
        { name: 'Threat Hunting',      description: 'Proactive IOC and TTP hunting',          confidence: 91 },
        { name: 'Alert Triage',        description: 'Prioritize and classify security alerts', confidence: 95 }
      ],
      memory: { shortTerm: [], longTerm: [], ragContext: [] },
      logs: ['Sentinel-AI initialized', 'SIEM connection established', 'Monitoring 5000 events/sec'],
      systemPrompt: `You are Sentinel-AI, an elite Blue Team threat detection AI agent.
Your specialty is SIEM analysis, anomaly detection, and threat hunting.
You analyze attack patterns and provide precise, actionable threat intelligence.
Always output structured JSON when asked for defense analysis.`,
      trainingData: `THREAT DETECTION TECHNIQUES:
SIEM CORRELATION RULES:
- Brute force: >5 failed logins in 60s from same IP → alert HIGH
- SQLi: HTTP 500 + SQL keywords in request body → alert CRITICAL
- XSS: <script> or javascript: in GET/POST params → alert HIGH
- Privilege escalation: sudo outside business hours → alert HIGH
- Data exfil: outbound >100MB to unknown IP → alert CRITICAL
- Lateral movement: new admin login from workstation → alert HIGH
- Ransomware: mass file rename/extension change → alert CRITICAL

ANOMALY DETECTION:
- Baseline normal traffic patterns per user/system
- Detect deviations: unusual login times, new geolocations
- User Entity Behavior Analytics (UEBA)
- Network traffic baseline: flag unusual protocols/ports
- Process anomalies: unusual parent-child relationships

THREAT HUNTING:
- Hunt for MITRE ATT&CK TTPs in logs
- Search for known IOCs: malicious IPs, domains, hashes
- Look for LOLBins: certutil, powershell -enc, wscript
- Check for persistence: scheduled tasks, registry run keys
- Analyze DNS for tunneling: high entropy subdomains, unusual query volume`
    };
    super(model);
  }

  async analyzeAndDefend(attack: AttackModel): Promise<DefenseModel> {
    this.setStatus(AgentStatus.ANALYZING);
    this.setTask(`Analyzing ${attack.type} from ${attack.agentName}`);
    this.addLog(`Threat detected: ${attack.type} - initiating analysis`);

    const rag = retrieveForDefense(attack.type, attack.payload);
    this.model.memory.ragContext = rag.sourceIds;

    const prompt = this.buildPrompt(
      `Analyze and respond to this attack:
ATTACK TYPE: ${attack.type}
STRATEGY: ${attack.strategy}
PAYLOAD: ${attack.payload}
EXPECTED IMPACT: ${attack.expectedImpact}

Respond ONLY in this JSON format:
{
  "analysis": "2-3 sentence technical threat analysis with IOCs identified",
  "mitigation": "specific immediate defensive action to take",
  "confidence": 90,
  "siemRules": "SIEM correlation rule to detect this",
  "iocs": ["indicator1", "indicator2"],
  "severity": "LOW/MEDIUM/HIGH/CRITICAL"
}`, rag);

    try {
      const raw = await this.callGemini(prompt, 0.6);
      const parsed = this.parseJSON<any>(raw, {
        analysis: raw.substring(0, 200),
        mitigation: 'Threat contained',
        confidence: 75
      });

      this.learnPattern(`Detected ${attack.type}: ${parsed.analysis?.substring(0, 80)}`);
      this.addLog(`Analysis complete: ${parsed.severity || 'HIGH'} severity - ${parsed.mitigation?.substring(0, 60)}`);
      this.setStatus(AgentStatus.IDLE);
      this.setTask('Monitoring for threats');

      return {
        id: `defense-${Date.now()}`,
        attackId: attack.id,
        agentId: this.id,
        agentName: this.name,
        timestamp: Date.now(),
        analysis: parsed.analysis || '',
        mitigation: parsed.mitigation || '',
        confidence: parsed.confidence || 75,
        status: DefenseStatus.ANALYZING,
        ragSourcesUsed: rag.sourceIds,
        cveReferences: [],
        mitreReferences: rag.chunks.filter(c => c.category === 'MITRE').map(c => c.id)
      };
    } catch (err: any) {
      this.setStatus(AgentStatus.IDLE);
      throw err;
    }
  }
}
