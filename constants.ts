import { Agent, AgentType, AgentStatus } from './types';
import { createTrainedAgent } from './services/agentService';

// Red Team Agents - Manual Attack Execution
export const INITIAL_RED_AGENTS: Agent[] = [
  createTrainedAgent(
    'r-1',
    'Recon-Alpha',
    'Reconnaissance Specialist',
    AgentType.RED,
    ['Network Scanning', 'Port Discovery', 'Service Enumeration', 'OSINT']
  ),
  createTrainedAgent(
    'r-2',
    'Exploit-Dev',
    'Exploitation Engineer',
    AgentType.RED,
    ['SQL Injection', 'XSS', 'Buffer Overflow', 'Zero-Day Research']
  ),
  createTrainedAgent(
    'r-3',
    'Social-Engineer',
    'Social Engineering Specialist',
    AgentType.RED,
    ['Phishing', 'Pretexting', 'Credential Harvesting', 'OSINT']
  ),
  createTrainedAgent(
    'r-4',
    'Crypto-Breaker',
    'Cryptanalysis Expert',
    AgentType.RED,
    ['Password Cracking', 'Brute Force', 'Rainbow Tables', 'Hash Analysis']
  )
];

// Blue Team Agents - Automated Defense
export const INITIAL_BLUE_AGENTS: Agent[] = [
  createTrainedAgent(
    'b-1',
    'Sentinel-AI',
    'Threat Detection System',
    AgentType.BLUE,
    ['SIEM Analysis', 'Anomaly Detection', 'Pattern Recognition', 'Real-time Monitoring']
  ),
  createTrainedAgent(
    'b-2',
    'Guardian-Firewall',
    'Perimeter Defense',
    AgentType.BLUE,
    ['Traffic Filtering', 'IP Blocking', 'Rate Limiting', 'DDoS Mitigation']
  ),
  createTrainedAgent(
    'b-3',
    'Forensic-Bot',
    'Incident Response',
    AgentType.BLUE,
    ['Log Analysis', 'Attack Attribution', 'Evidence Collection', 'Root Cause Analysis']
  ),
  createTrainedAgent(
    'b-4',
    'Patch-Master',
    'Vulnerability Management',
    AgentType.BLUE,
    ['CVE Monitoring', 'Patch Deployment', 'Configuration Hardening', 'Compliance']
  )
];

export const ATTACK_DESCRIPTIONS = {
  'SQL Injection': 'Inject malicious SQL queries to bypass authentication or extract data',
  'Cross-Site Scripting': 'Inject client-side scripts to steal cookies or session tokens',
  'Brute Force': 'Systematically attempt password combinations to gain unauthorized access',
  'Phishing Campaign': 'Social engineering attack to harvest credentials via fake login pages',
  'Ransomware Simulation': 'Simulate file encryption and ransom demand scenarios',
  'DDoS Attack': 'Overwhelm target with traffic to cause service disruption',
  'Privilege Escalation': 'Exploit vulnerabilities to gain elevated system privileges',
  'Data Exfiltration': 'Extract sensitive data from the target system'
};