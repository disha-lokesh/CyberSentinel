// ============================================================
// RAG KNOWLEDGE BASE
// Structured cybersecurity knowledge chunks used to ground
// agent prompts with real domain expertise.
// ============================================================

export interface KnowledgeChunk {
  id: string;
  category: 'MITRE' | 'CVE' | 'DEFENSE' | 'ATTACK' | 'FORENSICS' | 'COMPLIANCE';
  tags: string[];
  title: string;
  content: string;
}

// ── MITRE ATT&CK Techniques ──────────────────────────────────
const MITRE_CHUNKS: KnowledgeChunk[] = [
  {
    id: 'mitre-t1190',
    category: 'MITRE',
    tags: ['sql injection', 'web', 'initial access'],
    title: 'T1190 - Exploit Public-Facing Application',
    content: `Adversaries may attempt to exploit a weakness in an Internet-facing host or system to initially access a network. The weakness in the system can be a software bug, a temporary glitch, or a misconfiguration. SQL injection (SQLi) is a common technique where malicious SQL statements are inserted into an entry field for execution. Mitigations: WAF deployment, input validation, parameterized queries, least privilege DB accounts.`
  },
  {
    id: 'mitre-t1059',
    category: 'MITRE',
    tags: ['xss', 'scripting', 'execution'],
    title: 'T1059.007 - JavaScript/JScript Execution (XSS)',
    content: `Cross-site scripting (XSS) allows attackers to inject client-side scripts into web pages viewed by other users. Stored XSS persists in the database; Reflected XSS is in the URL. Attackers steal session cookies, redirect users, or perform actions on behalf of victims. Mitigations: Content Security Policy (CSP), output encoding, HttpOnly cookies, X-XSS-Protection headers.`
  },
  {
    id: 'mitre-t1110',
    category: 'MITRE',
    tags: ['brute force', 'credential', 'authentication'],
    title: 'T1110 - Brute Force',
    content: `Adversaries may use brute force techniques to gain access to accounts when passwords are unknown or when password hashes are obtained. Credential stuffing uses leaked credential pairs. Password spraying tries common passwords across many accounts. Mitigations: Account lockout policies, MFA, CAPTCHA, rate limiting, anomaly detection on failed logins.`
  },
  {
    id: 'mitre-t1566',
    category: 'MITRE',
    tags: ['phishing', 'social engineering', 'initial access'],
    title: 'T1566 - Phishing',
    content: `Adversaries may send phishing messages to gain access to victim systems. Spearphishing targets specific individuals with tailored lures. Phishing for credentials uses fake login pages. Mitigations: Email filtering, user training, DMARC/DKIM/SPF, multi-factor authentication, link scanning.`
  },
  {
    id: 'mitre-t1486',
    category: 'MITRE',
    tags: ['ransomware', 'encryption', 'impact'],
    title: 'T1486 - Data Encrypted for Impact',
    content: `Adversaries may encrypt data on target systems or on large numbers of systems in a network to interrupt availability to system and network resources. Ransomware typically uses AES-256 for file encryption and RSA for key exchange. Mitigations: Offline backups, endpoint detection, network segmentation, application whitelisting, immutable backup storage.`
  },
  {
    id: 'mitre-t1498',
    category: 'MITRE',
    tags: ['ddos', 'network', 'impact'],
    title: 'T1498 - Network Denial of Service',
    content: `Adversaries may perform Network Denial of Service (DoS) attacks to degrade or block the availability of targeted resources. Volumetric attacks flood bandwidth; Protocol attacks exploit weaknesses in layer 3/4; Application layer attacks target layer 7. Mitigations: DDoS protection services, rate limiting, anycast diffusion, traffic scrubbing, CDN.`
  },
  {
    id: 'mitre-t1068',
    category: 'MITRE',
    tags: ['privilege escalation', 'exploit', 'elevation'],
    title: 'T1068 - Exploitation for Privilege Escalation',
    content: `Adversaries may exploit software vulnerabilities in an attempt to elevate privileges. Common vectors include SUID binaries, kernel exploits, misconfigured sudo, DLL hijacking, token impersonation. Mitigations: Patch management, least privilege, application sandboxing, exploit protection (ASLR, DEP), privileged access workstations.`
  },
  {
    id: 'mitre-t1041',
    category: 'MITRE',
    tags: ['data exfiltration', 'c2', 'exfil'],
    title: 'T1041 - Exfiltration Over C2 Channel',
    content: `Adversaries may steal data by exfiltrating it over an existing command and control channel. Data may be compressed, encrypted, or encoded before transmission. Common channels: HTTPS, DNS tunneling, ICMP covert channels. Mitigations: DLP solutions, network monitoring, egress filtering, data classification, UEBA.`
  }
];

// ── CVE Knowledge ─────────────────────────────────────────────
const CVE_CHUNKS: KnowledgeChunk[] = [
  {
    id: 'cve-2021-41773',
    category: 'CVE',
    tags: ['apache', 'path traversal', 'rce', 'web'],
    title: 'CVE-2021-41773 - Apache HTTP Server Path Traversal',
    content: `CVSS 9.8 CRITICAL. A flaw was found in Apache HTTP Server 2.4.49. An attacker could use a path traversal attack to map URLs to files outside the directories configured by Alias-like directives. If files outside of these directories are not protected by the usual default configuration "require all denied", these requests can succeed. Patch: Upgrade to Apache 2.4.51+.`
  },
  {
    id: 'cve-2021-44228',
    category: 'CVE',
    tags: ['log4j', 'rce', 'java', 'critical'],
    title: 'CVE-2021-44228 - Log4Shell Remote Code Execution',
    content: `CVSS 10.0 CRITICAL. Apache Log4j2 JNDI features used in configuration, log messages, and parameters do not protect against attacker controlled LDAP and other JNDI related endpoints. An attacker who can control log messages or log message parameters can execute arbitrary code loaded from LDAP servers. Patch: Upgrade to Log4j 2.17.1+.`
  },
  {
    id: 'cve-2023-44487',
    category: 'CVE',
    tags: ['http2', 'ddos', 'rapid reset'],
    title: 'CVE-2023-44487 - HTTP/2 Rapid Reset Attack',
    content: `CVSS 7.5 HIGH. The HTTP/2 protocol allows a denial of service (server resource consumption) because request cancellation can reset many streams quickly. This is known as the Rapid Reset Attack. Affected: nginx, Apache, IIS, Cloudflare. Mitigations: Update web servers, implement request rate limiting, use DDoS protection services.`
  },
  {
    id: 'cve-2024-3400',
    category: 'CVE',
    tags: ['palo alto', 'firewall', 'rce', 'critical'],
    title: 'CVE-2024-3400 - PAN-OS Command Injection',
    content: `CVSS 10.0 CRITICAL. A command injection vulnerability in the GlobalProtect feature of Palo Alto Networks PAN-OS software allows an unauthenticated attacker to execute arbitrary code with root privileges on the firewall. Patch: Apply hotfix from Palo Alto Networks immediately.`
  }
];

// ── Defense Playbooks ─────────────────────────────────────────
const DEFENSE_CHUNKS: KnowledgeChunk[] = [
  {
    id: 'def-waf-config',
    category: 'DEFENSE',
    tags: ['waf', 'web', 'sql injection', 'xss'],
    title: 'WAF Configuration Best Practices',
    content: `Web Application Firewall rules for common attacks: Enable OWASP Core Rule Set (CRS) 3.3+. For SQLi: block UNION SELECT, OR 1=1, comment sequences (--,#,/*). For XSS: block <script>, javascript:, onerror=, onload=. Set anomaly scoring threshold to 5. Enable rate limiting: 100 req/min per IP. Log all blocked requests for forensics. Use learning mode for 2 weeks before enforcement.`
  },
  {
    id: 'def-incident-response',
    category: 'DEFENSE',
    tags: ['incident response', 'forensics', 'containment'],
    title: 'Incident Response Playbook',
    content: `IR phases: 1) Preparation - maintain asset inventory, IR team contacts, communication plan. 2) Identification - monitor SIEM alerts, correlate events, determine scope. 3) Containment - isolate affected systems, block attacker IPs, preserve evidence. 4) Eradication - remove malware, patch vulnerabilities, reset credentials. 5) Recovery - restore from clean backups, monitor for re-infection. 6) Lessons Learned - document timeline, update playbooks, train staff.`
  },
  {
    id: 'def-zero-trust',
    category: 'DEFENSE',
    tags: ['zero trust', 'network', 'architecture'],
    title: 'Zero Trust Architecture Principles',
    content: `Zero Trust: Never trust, always verify. Core principles: 1) Verify explicitly - authenticate and authorize every request. 2) Use least privilege access - JIT/JEA, risk-based adaptive policies. 3) Assume breach - minimize blast radius, segment access, encrypt everything. Implementation: MFA everywhere, microsegmentation, continuous monitoring, SASE, identity-centric security.`
  },
  {
    id: 'def-siem-rules',
    category: 'DEFENSE',
    tags: ['siem', 'detection', 'rules', 'anomaly'],
    title: 'SIEM Detection Rules for Common Attacks',
    content: `Key SIEM correlation rules: Brute Force - 5+ failed logins in 60s from same IP. SQLi - HTTP 500 errors with SQL keywords in request. XSS - script tags in GET/POST parameters. Privilege Escalation - sudo usage outside business hours. Data Exfiltration - outbound traffic >100MB to unknown IPs. Lateral Movement - new admin logins from workstations. Ransomware - mass file rename/extension change events.`
  },
  {
    id: 'def-network-segmentation',
    category: 'DEFENSE',
    tags: ['network', 'segmentation', 'firewall', 'vlan'],
    title: 'Network Segmentation Strategy',
    content: `Segment networks by function and sensitivity: DMZ for public-facing services, separate VLANs for servers/workstations/IoT/management. Firewall rules: default deny, explicit allow. Micro-segmentation with host-based firewalls. East-west traffic inspection. Jump servers for admin access. Network access control (NAC) for device authentication. Regular firewall rule audits.`
  }
];

// ── Forensics Knowledge ───────────────────────────────────────
const FORENSICS_CHUNKS: KnowledgeChunk[] = [
  {
    id: 'for-log-analysis',
    category: 'FORENSICS',
    tags: ['logs', 'analysis', 'evidence', 'timeline'],
    title: 'Digital Forensics Log Analysis',
    content: `Key log sources for forensic investigation: Web server logs (access.log, error.log), Authentication logs (/var/log/auth.log, Windows Security Event 4624/4625), Firewall logs, DNS query logs, Endpoint EDR telemetry. Timeline reconstruction: correlate timestamps across sources, account for timezone differences. Evidence preservation: hash all log files (SHA-256), maintain chain of custody, use write blockers.`
  },
  {
    id: 'for-malware-analysis',
    category: 'FORENSICS',
    tags: ['malware', 'analysis', 'reverse engineering'],
    title: 'Malware Analysis Techniques',
    content: `Static analysis: file hashing, string extraction, PE header analysis, YARA rules. Dynamic analysis: sandbox execution (Cuckoo, Any.run), network traffic capture, registry monitoring, process injection detection. Behavioral indicators: unusual parent-child process relationships, LOLBins usage (certutil, powershell, wscript), scheduled task creation, registry run key modifications.`
  }
];

// ── All knowledge chunks combined ────────────────────────────
export const KNOWLEDGE_BASE: KnowledgeChunk[] = [
  ...MITRE_CHUNKS,
  ...CVE_CHUNKS,
  ...DEFENSE_CHUNKS,
  ...FORENSICS_CHUNKS
];
