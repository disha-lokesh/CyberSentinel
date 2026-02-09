# 🎯 Quick Reference Card

## 30-Second Setup

```bash
npm install
# Edit .env.local → Add your Gemini API key
npm run dev
```

## Attack Types Quick Guide

| Icon | Attack | What It Does | Best Agent |
|------|--------|--------------|------------|
| 💾 | SQL Injection | Database attack | Exploit-Dev |
| ⚡ | XSS | Script injection | Exploit-Dev |
| 🔒 | Brute Force | Password cracking | Crypto-Breaker |
| 📧 | Phishing | Social engineering | Social-Engineer |
| 📁 | Ransomware | File encryption | Exploit-Dev |
| 📡 | DDoS | Service disruption | Recon-Alpha |
| 🔓 | Privilege Escalation | Access elevation | Exploit-Dev |
| 📤 | Data Exfiltration | Data theft | Recon-Alpha |

## Agent Quick Reference

### 🔴 Red Team (Offensive)

| Agent | Best For | Specialization |
|-------|----------|----------------|
| **Recon-Alpha** | Scanning, Discovery | Network recon, OSINT |
| **Exploit-Dev** | Exploitation | SQL, XSS, Zero-days |
| **Social-Engineer** | Phishing | Social attacks, credentials |
| **Crypto-Breaker** | Passwords | Brute force, hashing |

### 🔵 Blue Team (Defensive)

| Agent | Best For | Specialization |
|-------|----------|----------------|
| **Sentinel-AI** | Detection | SIEM, anomalies |
| **Guardian-Firewall** | Blocking | Traffic filtering, DDoS |
| **Forensic-Bot** | Investigation | Incident response |
| **Patch-Master** | Prevention | CVE monitoring, patches |

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Clean install
rm -rf node_modules package-lock.json && npm install
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| F12 | Open browser console |
| Ctrl+Shift+R | Hard refresh |
| Ctrl+C | Stop dev server |

## View Navigation

| View | Purpose | Key Feature |
|------|---------|-------------|
| **Dashboard** | Monitoring | Real-time metrics |
| **Red Team** | Attacks | Manual launch buttons |
| **Blue Team** | Defense | Auto-response |
| **Orchestrator** | Strategy | AI analysis |
| **Workflow** | Visualization | Agent flow |

## Status Indicators

### Attack Status
- 🟡 **INITIATED** - Attack started
- 🟠 **IN_PROGRESS** - Attack executing
- 🔴 **DETECTED** - Blue Team alerted
- 🔵 **BLOCKED** - Defense successful
- 🟢 **SUCCESS** - Attack succeeded

### Defense Status
- 🟡 **ANALYZING** - Threat analysis
- 🔵 **MITIGATING** - Defense active
- 🟢 **BLOCKED** - Attack stopped
- 🔴 **FAILED** - Defense failed

### Agent Status
- ⚪ **IDLE** - Waiting
- 🟡 **PLANNING** - Strategizing
- 🔵 **EXECUTING** - Active
- 🟠 **ANALYZING** - Investigating
- 🟢 **MITIGATING** - Defending

## Typical Workflow

```
1. Select Red Team agent
   ↓
2. Click attack button
   ↓
3. AI generates strategy (2s)
   ↓
4. Attack progresses
   ↓
5. Blue Team detects (auto)
   ↓
6. AI analyzes threat (2s)
   ↓
7. Defense executed (auto)
   ↓
8. Result displayed
```

## API Usage

| Action | API Calls | Time |
|--------|-----------|------|
| Launch attack | 1 | ~2s |
| Defense response | 1 | ~2s |
| Orchestrator update | 1 | ~3s |
| **Total per attack** | 2 | ~4s |

**Free Tier**: 15 requests/minute = ~7 attacks/minute

## Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| No API key warning | Set `VITE_GEMINI_API_KEY` in `.env.local` |
| Build fails | `rm -rf node_modules && npm install` |
| UI not updating | Hard refresh (Ctrl+Shift+R) |
| API errors | Check console (F12), verify key |
| Rate limited | Wait 1 minute |
| Attacks not working | Select agent first |

## File Locations

```
📁 Project Root
├── 📄 .env.local          ← API key here
├── 📁 src/
│   ├── 📄 App.tsx         ← Main app
│   ├── 📁 views/
│   │   ├── RedTeamView    ← Attack UI
│   │   └── BlueTeamView   ← Defense UI
│   └── 📁 services/
│       ├── geminiService  ← AI calls
│       └── agentService   ← Agent logic
└── 📁 Documentation/
    ├── START_HERE.md      ← Quick start
    └── SETUP_GUIDE.md     ← Full guide
```

## Environment Variables

```bash
# Required
VITE_GEMINI_API_KEY=AIzaSyC...

# Optional (defaults shown)
# None currently
```

## API Endpoints

All API calls go to:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
```

## Response Times

| Component | Load Time |
|-----------|-----------|
| Initial load | < 3s |
| View switch | < 0.5s |
| Attack launch | 1-2s |
| Defense response | 1-2s |
| UI update | Instant |

## Browser Support

| Browser | Supported | Notes |
|---------|-----------|-------|
| Chrome | ✅ | Recommended |
| Firefox | ✅ | Full support |
| Safari | ✅ | Full support |
| Edge | ✅ | Full support |
| Mobile | ✅ | Responsive |

## Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Dev server | 5173 | http://localhost:5173 |
| Preview | 4173 | http://localhost:4173 |

## Log Levels

| Level | Color | Meaning |
|-------|-------|---------|
| INFO | 🔵 Blue | Normal operation |
| WARN | 🟡 Yellow | Potential issue |
| CRITICAL | 🔴 Red | Serious threat |
| SUCCESS | 🟢 Green | Operation succeeded |

## Metrics

| Metric | What It Shows |
|--------|---------------|
| Attacks | Total attack attempts |
| Blocked | Successfully defended |
| Incidents | Unmitigated threats |
| Efficiency | Agent performance (%) |
| Confidence | Defense certainty (%) |

## Best Practices

### For Testing
1. Start with SQL Injection (easiest)
2. Use Exploit-Dev agent
3. Watch Blue Team response
4. Check Orchestrator analysis

### For Demos
1. Prepare API key beforehand
2. Test one attack first
3. Show Red → Blue flow
4. Highlight AI reasoning

### For Development
1. Check console for errors
2. Monitor API usage
3. Test all attack types
4. Verify defense responses

## Common Patterns

### Launch Multiple Attacks
```
1. Select agent
2. Launch attack 1
3. Wait 2 seconds
4. Launch attack 2
5. Switch to Blue Team
6. Watch defenses
```

### Monitor System
```
1. Go to Dashboard
2. Watch metrics chart
3. Check threat list
4. Review logs
5. Track incidents
```

### Analyze Strategy
```
1. Go to Orchestrator
2. Read AI reasoning
3. Check decision history
4. Review system stats
```

## Useful Links

- **Gemini API**: https://aistudio.google.com/app/apikey
- **Documentation**: See README.md
- **Quick Start**: See START_HERE.md
- **Full Guide**: See SETUP_GUIDE.md
- **Architecture**: See ARCHITECTURE.md

## Emergency Commands

```bash
# Server won't start
killall node
npm run dev

# Corrupted state
rm -rf node_modules .vite
npm install
npm run dev

# API not working
# Check .env.local
# Verify key at aistudio.google.com
# Check browser console

# Build broken
npm run build 2>&1 | grep -i error
# Fix errors shown
npm run build
```

## Quick Stats

- **8** Attack types
- **8** Specialized agents
- **4** Red Team agents
- **4** Blue Team agents
- **5** Views
- **3** AI functions
- **~2s** Average response time
- **15** Free API calls/minute

## Version Info

- **Version**: 1.0.0
- **React**: 19.2.4
- **TypeScript**: 5.8.2
- **Vite**: 6.2.0
- **Gemini**: 2.0 Flash

---

**Print this page for quick reference!** 📄
