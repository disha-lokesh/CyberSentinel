# 🚀 START HERE - Quick Launch Guide

## 3 Steps to Launch CyberSentinel

### Step 1: Get API Key (2 minutes)
1. Visit: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

### Step 2: Configure (1 minute)
Open `.env.local` and paste your key:
```
VITE_GEMINI_API_KEY=AIzaSyC...your_actual_key_here
```

### Step 3: Run (2 minutes)
```bash
npm install
npm run dev
```

Open: http://localhost:5173

---

## 🎮 First Attack in 30 Seconds

1. Click **"Red Team"** in sidebar
2. Click on **"Exploit-Dev"** agent card
3. Click **"SQL Injection"** button
4. Watch AI generate attack! 🔥

The Blue Team will automatically respond and try to block it.

---

## 📚 Full Documentation

- **SETUP_GUIDE.md** - Detailed usage instructions
- **IMPLEMENTATION_SUMMARY.md** - Technical details
- **README.md** - Project overview

---

## ⚡ Quick Tips

- **Red Team** = Manual attacks (you control)
- **Blue Team** = Auto-defense (AI responds)
- **Orchestrator** = Strategic AI analysis
- **Dashboard** = Real-time metrics

---

## 🆘 Problems?

**"No API Key" warning?**
→ Set `VITE_GEMINI_API_KEY` in `.env.local` and restart

**Nothing happens when clicking attack?**
→ Check browser console (F12) for errors

**Build fails?**
→ Run: `rm -rf node_modules && npm install`

---

## 🎯 What You'll See

### When You Launch an Attack:
```
✓ AI generates attack strategy
✓ Shows technical payload
✓ Displays expected impact
✓ Attack progresses through stages
✓ Blue Team automatically responds
```

### Blue Team Response:
```
✓ Detects threat automatically
✓ AI analyzes the attack
✓ Generates mitigation strategy
✓ Shows confidence score
✓ Attempts to block attack
```

---

## 🏆 Try These Attacks

1. **SQL Injection** - Database attack
2. **XSS** - Script injection
3. **Brute Force** - Password cracking
4. **Phishing** - Social engineering
5. **Ransomware** - File encryption
6. **DDoS** - Service disruption
7. **Privilege Escalation** - Access elevation
8. **Data Exfiltration** - Data theft

---

**Ready?** Run `npm install && npm run dev` now! 🚀
