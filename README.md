<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CyberSentinel - Gemini Agentic Platform

A real-time cybersecurity simulation platform powered by Google Gemini AI. Features autonomous Red Team (offensive) and Blue Team (defensive) AI agents that engage in realistic attack-defense scenarios.

## 🚀 Features

- **Manual Red Team Attacks**: Launch 8 different attack types with AI-generated strategies
- **Automated Blue Team Defense**: AI agents automatically detect and respond to threats
- **Real Gemini Integration**: Uses Gemini 2.0 Flash for agent decision-making
- **Trained Specialized Agents**: Each agent has specific cybersecurity specializations
- **Real-time Monitoring**: Live dashboards, logs, and metrics
- **Strategic Orchestrator**: AI-powered analysis of overall system security

## 🎯 Attack Types

- SQL Injection
- Cross-Site Scripting (XSS)
- Brute Force
- Phishing Campaign
- Ransomware Simulation
- DDoS Attack
- Privilege Escalation
- Data Exfiltration

## 📋 Prerequisites

- Node.js (v16 or higher)
- Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API Key:**
   
   Open `.env.local` and replace `YOUR_API_KEY_HERE` with your actual Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:5173
   ```

## 🎮 How to Use

### Red Team (Manual Attacks)

1. Navigate to "Red Team" view
2. Select an attack agent (Recon-Alpha, Exploit-Dev, etc.)
3. Click any attack button (SQL Injection, XSS, etc.)
4. Watch as Gemini AI generates realistic attack strategies
5. Monitor attack progression in real-time

### Blue Team (Automated Defense)

1. Navigate to "Blue Team" view
2. Agents automatically monitor for threats
3. When Red Team launches attacks, Blue Team responds automatically
4. AI analyzes threats and generates mitigation strategies
5. View defense statistics and confidence scores

### Orchestrator

- Strategic AI that analyzes overall system state
- Provides high-level threat assessments
- Recommends defensive strategies
- Updates every 10 seconds

## 🏗️ Architecture

```
services/
├── geminiService.ts      # Gemini API integration
├── agentService.ts       # Agent logic & attack/defense execution
├── workflowEngine.ts     # Workflow automation
└── mcpMock.ts           # MCP tool simulations

views/
├── RedTeamView.tsx      # Manual attack interface
├── BlueTeamView.tsx     # Automated defense interface
├── OrchestratorView.tsx # Strategic AI view
├── DashboardView.tsx    # Metrics & monitoring
└── WorkflowView.tsx     # Agent workflow visualization
```

## 🤖 AI Agents

### Red Team
- **Recon-Alpha**: Network scanning & reconnaissance
- **Exploit-Dev**: Vulnerability exploitation
- **Social-Engineer**: Phishing & social engineering
- **Crypto-Breaker**: Password cracking & cryptanalysis

### Blue Team
- **Sentinel-AI**: Threat detection & SIEM analysis
- **Guardian-Firewall**: Perimeter defense & traffic filtering
- **Forensic-Bot**: Incident response & forensics
- **Patch-Master**: Vulnerability management & patching

## 🔧 Troubleshooting

**"No API Key" warning:**
- Make sure you've set `VITE_GEMINI_API_KEY` in `.env.local`
- Restart the dev server after changing environment variables

**Agents not responding:**
- Check browser console for API errors
- Verify your API key is valid
- Check your API quota at [Google AI Studio](https://aistudio.google.com)

**Build errors:**
- Run `npm install` to ensure all dependencies are installed
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

## 📊 Tech Stack

- **Frontend**: React 19 + TypeScript
- **AI**: Google Gemini 2.0 Flash
- **Build**: Vite
- **Charts**: Recharts
- **Icons**: Lucide React

## 🔐 Security Note

This is a **simulation platform** for cybersecurity training. All attacks are simulated and do not target real systems. Use responsibly and only in authorized environments.

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

View your app in AI Studio: https://ai.studio/apps/drive/1YSHK1YoMmXgWA8Zve7IDxAvaE5l7Id_g
