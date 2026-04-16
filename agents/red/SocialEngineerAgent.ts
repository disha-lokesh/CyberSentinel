// ============================================================
// SOCIAL ENGINEER AGENT - Red Team Social Engineering
// Trained on: Phishing, pretexting, credential harvesting
// ============================================================

import { BaseAgent } from '../BaseAgent';
import { AgentModel, AgentType, AgentStatus } from '../../models/AgentModel';
import { AttackModel, AttackType, AttackStatus } from '../../models/AttackModel';
import { retrieveForAttack } from '../../rag/ragEngine';

export class SocialEngineerAgent extends BaseAgent {
  constructor() {
    const model: AgentModel = {
      id: 'r-3',
      name: 'Social-Engineer',
      role: 'Social Engineering Specialist',
      type: AgentType.RED,
      status: AgentStatus.IDLE,
      currentTask: 'Awaiting orders',
      efficiency: 91,
      capabilities: [
        { name: 'Phishing',              description: 'Spearphishing email campaigns',        confidence: 96 },
        { name: 'Pretexting',            description: 'Fabricated scenarios for manipulation', confidence: 88 },
        { name: 'Credential Harvesting', description: 'Fake login page deployment',           confidence: 93 },
        { name: 'Vishing',               description: 'Voice-based social engineering',       confidence: 82 }
      ],
      memory: { shortTerm: [], longTerm: [], ragContext: [] },
      logs: ['Social-Engineer initialized', 'Specialization: Phishing, Pretexting, Credential Harvesting'],
      systemPrompt: `You are Social-Engineer, an elite Red Team social engineering AI agent.
Your specialty is human-factor attacks: phishing campaigns, pretexting, credential harvesting, and psychological manipulation.
You craft convincing, realistic social engineering scenarios for security awareness training.
Always output structured JSON when asked for attack plans.`,
      trainingData: `SOCIAL ENGINEERING TECHNIQUES:
PHISHING:
- Spearphishing: research target on LinkedIn, craft personalized lure
- Pretexting: impersonate IT support, HR, or vendor
- Urgency triggers: "Your account will be suspended", "Immediate action required"
- Domain spoofing: company-login.com, company-secure.net, company-portal.org
- Email headers: SPF/DKIM bypass, display name spoofing

CREDENTIAL HARVESTING:
- Clone legitimate login pages (Office 365, VPN, corporate SSO)
- Evilginx2 for MFA bypass via reverse proxy
- GoPhish for campaign management
- Track open rates, click rates, credential submission rates

PRETEXTING SCENARIOS:
- IT helpdesk: "We need to verify your credentials for system upgrade"
- HR: "Please review and sign your updated employment contract"
- Vendor: "Invoice payment confirmation required"
- Executive impersonation (BEC): urgent wire transfer requests

INDICATORS OF COMPROMISE:
- Unusual sender domains, mismatched reply-to addresses
- Urgency language, threats of account suspension
- Links to non-corporate domains, shortened URLs`
    };
    super(model);
  }

  async executeAttack(attackType: AttackType, target: string): Promise<AttackModel> {
    this.setStatus(AgentStatus.EXECUTING);
    this.setTask(`Executing ${attackType} campaign against ${target}`);
    this.addLog(`Designing ${attackType} campaign targeting ${target}`);

    const rag = retrieveForAttack(attackType);
    this.model.memory.ragContext = rag.sourceIds;

    const prompt = this.buildPrompt(
      `Design a ${attackType} campaign against: ${target}

Respond ONLY in this JSON format:
{
  "strategy": "2-3 sentence social engineering approach",
  "payload": "email subject + body template or attack scenario",
  "expectedImpact": "credentials/access obtained",
  "targetProfile": "who is being targeted and why",
  "detectionEvasion": "how to avoid spam filters and user suspicion"
}`, rag);

    try {
      const raw = await this.callGemini(prompt, 0.8);
      const parsed = this.parseJSON<any>(raw, {
        strategy: raw.substring(0, 200),
        payload: 'Social engineering campaign designed',
        expectedImpact: 'Credentials harvested'
      });

      this.learnPattern(`${attackType} campaign: ${parsed.strategy?.substring(0, 80)}`);
      this.addLog(`Campaign designed: ${parsed.strategy?.substring(0, 60)}...`);
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
