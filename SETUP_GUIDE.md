# CyberSentinel Setup Guide

## Quick Start (5 minutes)

### Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

### Step 2: Configure the App

1. Open `.env.local` file in the project root
2. Replace `YOUR_API_KEY_HERE` with your actual API key:
   ```
   VITE_GEMINI_API_KEY=AIzaSyC...your_key_here
   ```
3. Save the file

### Step 3: Install & Run

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will open at `http://localhost:5173`

## Using the Platform

### 🔴 Red Team (Offensive)

**Purpose**: Manually launch simulated cyberattacks

**How to use**:
1. Click "Red Team" in the sidebar
2. Select an agent (e.g., "Recon-Alpha" for reconnaissance)
3. Click any attack button:
   - **SQL Injection**: Database attacks
   - **XSS**: Client-side script injection
   - **Brute Force**: Password cracking
   - **Phishing**: Social engineering
   - **Ransomware**: File encryption simulation
   - **DDoS**: Service disruption
   - **Privilege Escalation**: System access elevation
   - **Data Exfiltration**: Data theft simulation

4. Watch the AI generate:
   - Attack strategy
   - Technical payload
   - Expected impact

**What happens**:
- Gemini AI creates a realistic attack plan
- Attack progresses through stages: INITIATED → IN_PROGRESS → DETECTED
- Blue Team automatically responds

### 🔵 Blue Team (Defensive)

**Purpose**: Automated threat detection and response

**How it works**:
1. Click "Blue Team" in the sidebar
2. Agents automatically monitor for threats
3. When Red Team attacks:
   - Blue Team detects the threat
   - AI analyzes the attack
   - Generates mitigation strategy
   - Attempts to block the attack

**Agents**:
- **Sentinel-AI**: Detects anomalies in logs
- **Guardian-Firewall**: Blocks malicious traffic
- **Forensic-Bot**: Investigates incidents
- **Patch-Master**: Manages vulnerabilities

**Metrics**:
- Total threats detected
- Successfully blocked attacks
- Currently analyzing threats
- Failed mitigations

### 🧠 Orchestrator

**Purpose**: Strategic AI oversight

**Features**:
- Analyzes overall system security
- Provides threat assessments
- Recommends defensive strategies
- Updates every 10 seconds

**How to use**:
1. Click "Orchestrator" in sidebar
2. View AI reasoning in real-time
3. Check decision history
4. Monitor neural network stats

### 📊 Dashboard

**Purpose**: Real-time monitoring

**Displays**:
- Attack/defense metrics over time
- Live system logs
- Active threats
- Security incidents

## Agent Specializations

### Red Team Agents

| Agent | Specialization |
|-------|---------------|
| Recon-Alpha | Network Scanning, Port Discovery, Service Enumeration, OSINT |
| Exploit-Dev | SQL Injection, XSS, Buffer Overflow, Zero-Day Research |
| Social-Engineer | Phishing, Pretexting, Credential Harvesting, OSINT |
| Crypto-Breaker | Password Cracking, Brute Force, Rainbow Tables, Hash Analysis |

### Blue Team Agents

| Agent | Specialization |
|-------|---------------|
| Sentinel-AI | SIEM Analysis, Anomaly Detection, Pattern Recognition, Real-time Monitoring |
| Guardian-Firewall | Traffic Filtering, IP Blocking, Rate Limiting, DDoS Mitigation |
| Forensic-Bot | Log Analysis, Attack Attribution, Evidence Collection, Root Cause Analysis |
| Patch-Master | CVE Monitoring, Patch Deployment, Configuration Hardening, Compliance |

## Example Workflow

1. **Launch Attack**:
   - Go to Red Team
   - Select "Exploit-Dev"
   - Click "SQL Injection"
   - AI generates: `"Inject malicious SQL to bypass authentication using UNION-based technique"`

2. **Automatic Defense**:
   - Blue Team detects attack
   - "Sentinel-AI" analyzes threat
   - AI responds: `"SQL injection detected. Implementing WAF rules to block malicious patterns"`
   - Attack blocked with 92% confidence

3. **Strategic Analysis**:
   - Go to Orchestrator
   - View AI assessment: `"SQL injection attempts increasing. Recommend: Enable parameterized queries, update WAF signatures, conduct code review"`

## Troubleshooting

### "Simulation Mode" Message

**Problem**: App shows "[SIMULATION MODE - No API Key]"

**Solution**:
1. Check `.env.local` has correct API key
2. Restart dev server: `Ctrl+C` then `npm run dev`
3. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### API Errors

**Problem**: "Error connecting to Gemini API"

**Solutions**:
- Verify API key is valid at [AI Studio](https://aistudio.google.com)
- Check API quota (free tier: 15 requests/minute)
- Wait a minute if rate limited
- Check internet connection

### Agents Not Responding

**Problem**: Clicking attack buttons does nothing

**Solutions**:
1. Open browser console (F12)
2. Look for errors
3. Ensure API key is set
4. Try refreshing the page

### Build Errors

**Problem**: `npm run dev` fails

**Solutions**:
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Try again
npm run dev
```

## Advanced Configuration

### Adjust AI Temperature

Edit `services/geminiService.ts`:

```typescript
config: {
  temperature: 0.7,  // 0.0 = deterministic, 1.0 = creative
  maxOutputTokens: 500,
}
```

### Change Attack Success Rate

Edit `views/BlueTeamView.tsx`:

```typescript
const success = Math.random() > 0.2; // 80% success rate
```

### Modify Agent Efficiency

Edit `services/agentService.ts`:

```typescript
efficiency: 85 + Math.floor(Math.random() * 15), // 85-100%
```

## API Usage & Costs

**Free Tier**:
- 15 requests per minute
- 1,500 requests per day
- Sufficient for testing

**Typical Usage**:
- Each attack: 1-2 API calls
- Each defense: 1-2 API calls
- Orchestrator: 1 call per 10 seconds

**Estimate**: ~100-200 requests per hour of active use

## Security & Ethics

⚠️ **Important**:
- This is a **simulation platform** only
- Do NOT use against real systems without authorization
- All attacks are simulated and educational
- Use responsibly in controlled environments

## Next Steps

1. ✅ Set up API key
2. ✅ Launch first attack
3. ✅ Watch Blue Team respond
4. ✅ Check Orchestrator analysis
5. 🎯 Experiment with different attack types
6. 🎯 Monitor defense success rates
7. 🎯 Analyze AI reasoning patterns

## Support

- Check browser console for errors
- Verify API key is active
- Review [Gemini API docs](https://ai.google.dev/docs)
- Check [GitHub issues](https://github.com/your-repo/issues)

---

**Ready to start?** Run `npm run dev` and navigate to Red Team! 🚀
