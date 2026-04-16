// ============================================================
// GUARDIAN AGENT - Blue Team Perimeter Defense
// Trained on: Firewall, WAF, DDoS mitigation, IP blocking
// ============================================================

import { BaseAgent } from '../BaseAgent';
import { AgentModel, AgentType, AgentStatus } from '../../models/AgentModel';
import { AttackModel, DefenseModel, DefenseStatus } from '../../models/AttackModel';
import { retrieveForDefense } from '../../rag/ragEngine';

export class GuardianAgent extends BaseAgent {
  constructor() {
    const model: AgentModel = {
      id: 'b-2',
      name: 'Guardian-Firewall',
      role: 'Perimeter Defense System',
      type: AgentType.BLUE,
      status: AgentStatus.IDLE,
      currentTask: 'Monitoring perimeter',
      efficiency: 99,
      capabilities: [
        { name: 'WAF Management',      description: 'Web Application Firewall rule management', confidence: 98 },
        { name: 'IP Blocking',         description: 'Dynamic IP blocklist management',           confidence: 99 },
        { name: 'DDoS Mitigation',     description: 'Traffic scrubbing and rate limiting',       confidence: 95 },
        { name: 'Network Segmentation',description: 'VLAN and firewall rule enforcement',        confidence: 93 }
      ],
      memory: { shortTerm: [], longTerm: [], ragContext: [] },
      logs: ['Guardian-Firewall initialized', 'WAF rules loaded: 2847 active rules', 'Perimeter monitoring active'],
      systemPrompt: `You are Guardian-Firewall, an elite Blue Team perimeter defense AI agent.
Your specialty is WAF management, IP blocking, DDoS mitigation, and network segmentation.
You enforce perimeter security with precision and speed.
Always output structured JSON when asked for defense analysis.`,
      trainingData: `PERIMETER DEFENSE TECHNIQUES:
WAF RULES (OWASP CRS):
- SQLi rules: REQUEST-942-APPLICATION-ATTACK-SQLI
- XSS rules: REQUEST-941-APPLICATION-ATTACK-XSS
- RFI/LFI: REQUEST-930-APPLICATION-ATTACK-LFI
- Anomaly scoring: block if score >= 5
- Rate limiting: 100 req/min per IP, 1000 req/min per subnet

IP BLOCKING:
- Automatic block on 3+ WAF rule triggers from same IP
- Geo-blocking for high-risk countries
- Threat intelligence feeds: AbuseIPDB, Spamhaus, Emerging Threats
- Temporary blocks: 1 hour for brute force, permanent for known malicious
- Allowlist for trusted IPs (office, VPN, CDN ranges)

DDoS MITIGATION:
- Traffic scrubbing: route through scrubbing center
- Rate limiting: SYN cookies, connection limits
- Anycast routing: distribute attack traffic
- BGP blackholing for volumetric attacks
- Challenge pages (CAPTCHA) for suspicious traffic
- CDN absorption: Cloudflare, Akamai, AWS Shield

NETWORK SEGMENTATION:
- DMZ for public-facing services
- Separate VLANs: servers, workstations, IoT, management
- Default deny firewall rules, explicit allow
- East-west traffic inspection
- Jump servers for admin access`
    };
    super(model);
  }

  async analyzeAndDefend(attack: AttackModel): Promise<DefenseModel> {
    this.setStatus(AgentStatus.MITIGATING);
    this.setTask(`Blocking ${attack.type} at perimeter`);
    this.addLog(`Perimeter alert: ${attack.type} detected - deploying countermeasures`);

    const rag = retrieveForDefense(attack.type, attack.payload);
    this.model.memory.ragContext = rag.sourceIds;

    const prompt = this.buildPrompt(
      `Deploy perimeter defenses against this attack:
ATTACK TYPE: ${attack.type}
PAYLOAD: ${attack.payload}
STRATEGY: ${attack.strategy}

Respond ONLY in this JSON format:
{
  "analysis": "perimeter-level threat assessment",
  "mitigation": "specific WAF rules, IP blocks, or rate limits to deploy",
  "confidence": 95,
  "firewallRules": ["rule1", "rule2"],
  "blockedIPs": ["IP or range to block"],
  "rateLimits": "rate limiting configuration to apply"
}`, rag);

    try {
      const raw = await this.callGemini(prompt, 0.5);
      const parsed = this.parseJSON<any>(raw, {
        analysis: raw.substring(0, 200),
        mitigation: 'Perimeter defenses deployed',
        confidence: 90
      });

      this.learnPattern(`Blocked ${attack.type}: ${parsed.mitigation?.substring(0, 80)}`);
      this.addLog(`Countermeasures deployed: ${parsed.mitigation?.substring(0, 60)}`);
      this.setStatus(AgentStatus.IDLE);
      this.setTask('Monitoring perimeter');

      return {
        id: `defense-${Date.now()}`,
        attackId: attack.id,
        agentId: this.id,
        agentName: this.name,
        timestamp: Date.now(),
        analysis: parsed.analysis || '',
        mitigation: parsed.mitigation || '',
        confidence: parsed.confidence || 90,
        status: DefenseStatus.MITIGATING,
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
