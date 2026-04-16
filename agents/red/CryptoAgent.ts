// ============================================================
// CRYPTO AGENT - Red Team Cryptanalysis Expert
// Trained on: Brute force, hash cracking, DDoS, data exfil
// ============================================================

import { BaseAgent } from '../BaseAgent';
import { AgentModel, AgentType, AgentStatus } from '../../models/AgentModel';
import { AttackModel, AttackType, AttackStatus } from '../../models/AttackModel';
import { retrieveForAttack } from '../../rag/ragEngine';

export class CryptoAgent extends BaseAgent {
  constructor() {
    const model: AgentModel = {
      id: 'r-4',
      name: 'Crypto-Breaker',
      role: 'Cryptanalysis & Network Attack Expert',
      type: AgentType.RED,
      status: AgentStatus.IDLE,
      currentTask: 'Awaiting orders',
      efficiency: 89,
      capabilities: [
        { name: 'Brute Force',         description: 'Dictionary and hybrid password attacks',  confidence: 95 },
        { name: 'Hash Cracking',       description: 'MD5, SHA1, NTLM, bcrypt cracking',        confidence: 90 },
        { name: 'DDoS',                description: 'Volumetric and application layer floods',  confidence: 87 },
        { name: 'Data Exfiltration',   description: 'Covert channel data theft',               confidence: 85 }
      ],
      memory: { shortTerm: [], longTerm: [], ragContext: [] },
      logs: ['Crypto-Breaker initialized', 'Specialization: Brute Force, Hash Cracking, DDoS, Data Exfiltration'],
      systemPrompt: `You are Crypto-Breaker, an elite Red Team cryptanalysis and network attack AI agent.
Your specialty is credential attacks (brute force, hash cracking), network disruption (DDoS), and covert data exfiltration.
You are highly technical and precise. Always output structured JSON when asked for attack plans.`,
      trainingData: `BRUTE FORCE & HASH CRACKING:
- Hydra: hydra -l admin -P rockyou.txt ssh://target
- Hashcat: hashcat -m 1000 hashes.txt rockyou.txt (NTLM)
- John: john --wordlist=rockyou.txt --format=bcrypt hashes.txt
- Password spraying: 1 password across many accounts to avoid lockout
- Common passwords: Password1!, Welcome1, Summer2024!, Company@123
- Rainbow tables for MD5/SHA1 (not bcrypt/Argon2)

DDoS TECHNIQUES:
- HTTP Flood: 100k GET requests/sec to /search endpoint
- Slowloris: keep connections open with partial HTTP headers
- UDP Flood: amplification via DNS/NTP reflection
- SYN Flood: half-open TCP connections exhausting server state
- Application layer: POST floods to login/search/API endpoints
- Botnet C2: distributed attack from compromised hosts

DATA EXFILTRATION:
- DNS tunneling: iodine, dnscat2 - encode data in DNS queries
- HTTPS to attacker C2: mimics normal web traffic
- ICMP covert channel: data in ping packet payloads
- Steganography: hide data in image/document files
- Cloud storage abuse: upload to attacker-controlled S3/GDrive
- Timing channels: exfil via response time variations`
    };
    super(model);
  }

  async executeAttack(attackType: AttackType, target: string): Promise<AttackModel> {
    this.setStatus(AgentStatus.EXECUTING);
    this.setTask(`Executing ${attackType} against ${target}`);
    this.addLog(`Launching ${attackType} attack on ${target}`);

    const rag = retrieveForAttack(attackType);
    this.model.memory.ragContext = rag.sourceIds;

    const prompt = this.buildPrompt(
      `Execute a ${attackType} attack against: ${target}

Respond ONLY in this JSON format:
{
  "strategy": "2-3 sentence technical attack approach",
  "payload": "specific command, tool syntax, or attack configuration",
  "expectedImpact": "service disruption, credentials obtained, or data stolen",
  "toolsUsed": ["tool1", "tool2"],
  "detectionRisk": "LOW/MEDIUM/HIGH and why"
}`, rag);

    try {
      const raw = await this.callGemini(prompt, 0.8);
      const parsed = this.parseJSON<any>(raw, {
        strategy: raw.substring(0, 200),
        payload: 'Attack payload configured',
        expectedImpact: 'Target compromised'
      });

      this.learnPattern(`${attackType}: ${parsed.strategy?.substring(0, 80)}`);
      this.addLog(`Attack configured: ${parsed.payload?.substring(0, 60)}...`);
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
