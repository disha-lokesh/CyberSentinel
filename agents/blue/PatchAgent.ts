// ============================================================
// PATCH AGENT - Blue Team Vulnerability Management
// Trained on: CVE monitoring, patch deployment, hardening
// ============================================================

import { BaseAgent } from '../BaseAgent';
import { AgentModel, AgentType, AgentStatus } from '../../models/AgentModel';
import { AttackModel, DefenseModel, DefenseStatus } from '../../models/AttackModel';
import { retrieveForDefense } from '../../rag/ragEngine';

export class PatchAgent extends BaseAgent {
  constructor() {
    const model: AgentModel = {
      id: 'b-4',
      name: 'Patch-Master',
      role: 'Vulnerability Management',
      type: AgentType.BLUE,
      status: AgentStatus.IDLE,
      currentTask: 'Monitoring CVE feeds',
      efficiency: 100,
      capabilities: [
        { name: 'CVE Monitoring',          description: 'Real-time NVD/CISA KEV feed monitoring', confidence: 99 },
        { name: 'Patch Deployment',        description: 'Automated patch testing and deployment',  confidence: 96 },
        { name: 'Configuration Hardening', description: 'CIS Benchmark compliance enforcement',    confidence: 94 },
        { name: 'Vulnerability Scanning',  description: 'Nessus/OpenVAS-style vuln assessment',   confidence: 92 }
      ],
      memory: { shortTerm: [], longTerm: [], ragContext: [] },
      logs: ['Patch-Master initialized', 'CVE feed connected: NVD, CISA KEV', 'Vulnerability scanner active'],
      systemPrompt: `You are Patch-Master, an elite Blue Team vulnerability management AI agent.
Your specialty is CVE monitoring, patch deployment, configuration hardening, and compliance.
You identify and remediate vulnerabilities before attackers can exploit them.
Always output structured JSON when asked for defense analysis.`,
      trainingData: `VULNERABILITY MANAGEMENT:
CVE PRIORITIZATION (CVSS + EPSS):
- CRITICAL (CVSS 9.0-10.0): patch within 24 hours
- HIGH (CVSS 7.0-8.9): patch within 7 days
- MEDIUM (CVSS 4.0-6.9): patch within 30 days
- LOW (CVSS 0.1-3.9): patch within 90 days
- CISA KEV: patch within 2 weeks regardless of CVSS

PATCH DEPLOYMENT PROCESS:
1. Identify affected systems via asset inventory
2. Test patch in staging environment (24-48 hours)
3. Deploy to production during maintenance window
4. Verify patch applied: version check, vulnerability rescan
5. Document in change management system

CONFIGURATION HARDENING (CIS Benchmarks):
- Disable unnecessary services and ports
- Remove default credentials
- Enable audit logging
- Configure host-based firewall
- Implement least privilege
- Enable MFA for all admin accounts
- Encrypt data at rest and in transit
- Regular backup testing

VULNERABILITY SCANNING:
- Weekly authenticated scans of all systems
- Continuous monitoring for new CVEs affecting inventory
- Prioritize internet-facing and critical systems
- Track remediation SLAs in vulnerability management platform`
    };
    super(model);
  }

  async analyzeAndDefend(attack: AttackModel): Promise<DefenseModel> {
    this.setStatus(AgentStatus.ANALYZING);
    this.setTask(`Patching vulnerabilities exploited by ${attack.type}`);
    this.addLog(`Vulnerability assessment triggered by ${attack.type} attack`);

    const rag = retrieveForDefense(attack.type, attack.payload);
    this.model.memory.ragContext = rag.sourceIds;

    const prompt = this.buildPrompt(
      `Identify and remediate vulnerabilities exploited in this attack:
ATTACK TYPE: ${attack.type}
PAYLOAD: ${attack.payload}
EXPECTED IMPACT: ${attack.expectedImpact}

Respond ONLY in this JSON format:
{
  "analysis": "vulnerability analysis - what weakness was exploited",
  "mitigation": "specific patch, configuration change, or hardening step",
  "confidence": 92,
  "cveIds": ["CVE-XXXX-XXXXX if applicable"],
  "affectedSystems": ["system or component affected"],
  "remediationSteps": ["step1", "step2", "step3"],
  "patchPriority": "CRITICAL/HIGH/MEDIUM/LOW"
}`, rag);

    try {
      const raw = await this.callGemini(prompt, 0.5);
      const parsed = this.parseJSON<any>(raw, {
        analysis: raw.substring(0, 200),
        mitigation: 'Vulnerability patched',
        confidence: 85
      });

      this.learnPattern(`${attack.type} vuln: ${parsed.cveIds?.join(', ') || 'No CVE'}`);
      this.addLog(`Remediation plan: ${parsed.patchPriority || 'HIGH'} priority - ${parsed.mitigation?.substring(0, 60)}`);
      this.setStatus(AgentStatus.IDLE);
      this.setTask('Monitoring CVE feeds');

      return {
        id: `defense-${Date.now()}`,
        attackId: attack.id,
        agentId: this.id,
        agentName: this.name,
        timestamp: Date.now(),
        analysis: parsed.analysis || '',
        mitigation: parsed.mitigation || '',
        confidence: parsed.confidence || 85,
        status: DefenseStatus.MITIGATING,
        ragSourcesUsed: rag.sourceIds,
        cveReferences: parsed.cveIds || rag.chunks.filter(c => c.category === 'CVE').map(c => c.id),
        mitreReferences: rag.chunks.filter(c => c.category === 'MITRE').map(c => c.id)
      };
    } catch (err: any) {
      this.setStatus(AgentStatus.IDLE);
      throw err;
    }
  }
}
