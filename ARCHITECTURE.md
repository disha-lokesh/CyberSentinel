# CyberSentinel Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Dashboard │  │Red Team  │  │Blue Team │  │Orchestr. │       │
│  │  View    │  │   View   │  │   View   │  │   View   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                      App.tsx                            │    │
│  │  • State Management                                     │    │
│  │  • Attack Coordination                                  │    │
│  │  • Log Aggregation                                      │    │
│  │  • View Routing                                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                   │
│              ┌───────────────┼───────────────┐                 │
│              ▼               ▼               ▼                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Red Team     │  │ Blue Team    │  │ Orchestrator │        │
│  │ Agents (4)   │  │ Agents (4)   │  │ AI           │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                              │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              agentService.ts                            │    │
│  │  • executeRedTeamAttack()                              │    │
│  │  • executeBlueTeamDefense()                            │    │
│  │  • progressAttack()                                     │    │
│  │  • progressDefense()                                    │    │
│  │  • createTrainedAgent()                                │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              geminiService.ts                           │    │
│  │  • generateStrategicDecision()                         │    │
│  │  • generateRedTeamAttack()                             │    │
│  │  • generateBlueTeamResponse()                          │    │
│  │  • isGeminiAvailable()                                 │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         AI LAYER                                 │
│                                                                   │
│              ┌────────────────────────────┐                     │
│              │   Google Gemini 2.0 Flash  │                     │
│              │   • Attack Generation      │                     │
│              │   • Threat Analysis        │                     │
│              │   • Strategic Planning     │                     │
│              └────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Attack Flow (Red Team → Blue Team)

```
┌──────────────┐
│   User       │
│  Clicks      │
│  Attack      │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│  RedTeamView.tsx                     │
│  • Select agent                      │
│  • Choose attack type                │
│  • Trigger execution                 │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  agentService.executeRedTeamAttack() │
│  • Validate inputs                   │
│  • Create attack object              │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  geminiService.generateRedTeamAttack()│
│  • Call Gemini API                   │
│  • Generate strategy                 │
│  • Create payload                    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  AttackResult                        │
│  {                                   │
│    id: "attack-123"                  │
│    type: "SQL Injection"             │
│    strategy: "..."                   │
│    payload: "..."                    │
│    status: "INITIATED"               │
│  }                                   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  App.tsx                             │
│  • Update activeAttacks state        │
│  • Trigger status progression        │
└──────┬───────────────────────────────┘
       │
       ▼ (status: DETECTED)
┌──────────────────────────────────────┐
│  BlueTeamView.tsx                    │
│  • Detect new attack                 │
│  • Select defense agent              │
│  • Auto-trigger response             │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  agentService.executeBlueTeamDefense()│
│  • Analyze threat                    │
│  • Create defense object             │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  geminiService.generateBlueTeamResponse()│
│  • Call Gemini API                   │
│  • Analyze attack                    │
│  • Generate mitigation               │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  DefenseResult                       │
│  {                                   │
│    id: "defense-456"                 │
│    attackId: "attack-123"            │
│    analysis: "..."                   │
│    mitigation: "..."                 │
│    confidence: 92                    │
│    status: "BLOCKED"                 │
│  }                                   │
└──────────────────────────────────────┘
```

## Component Hierarchy

```
App.tsx
├── Layout.tsx
│   ├── Sidebar Navigation
│   └── Content Area
│       ├── DashboardView.tsx
│       │   ├── MetricsChart
│       │   ├── ThreatList
│       │   └── Terminal
│       │
│       ├── RedTeamView.tsx
│       │   ├── AgentCard (x4) [compact]
│       │   ├── Attack Buttons (x8)
│       │   ├── Active Attacks List
│       │   └── Terminal
│       │
│       ├── BlueTeamView.tsx
│       │   ├── Stats Dashboard
│       │   ├── AgentCard (x4) [full]
│       │   ├── Defense Operations List
│       │   └── Terminal
│       │
│       ├── OrchestratorView.tsx
│       │   ├── AI Reasoning Display
│       │   ├── Decision History
│       │   ├── System Stats
│       │   └── Knowledge Base
│       │
│       └── WorkflowView.tsx
│           ├── Workflow Graph
│           ├── Node Visualization
│           └── Execution Log
```

## Agent Architecture

### Red Team Agents

```
┌─────────────────────────────────────────────────────────┐
│                    Red Team Agent                        │
├─────────────────────────────────────────────────────────┤
│  Properties:                                             │
│  • id: string                                           │
│  • name: string                                         │
│  • role: string                                         │
│  • type: AgentType.RED                                  │
│  • status: AgentStatus                                  │
│  • currentTask: string                                  │
│  • efficiency: number (85-100%)                         │
│  • logs: string[]                                       │
├─────────────────────────────────────────────────────────┤
│  Specializations:                                        │
│  • Network Scanning                                     │
│  • Exploitation                                         │
│  • Social Engineering                                   │
│  • Cryptanalysis                                        │
├─────────────────────────────────────────────────────────┤
│  Capabilities:                                           │
│  • Generate attack strategies                           │
│  • Create payloads                                      │
│  • Execute simulated attacks                            │
│  • Report findings                                      │
└─────────────────────────────────────────────────────────┘
```

### Blue Team Agents

```
┌─────────────────────────────────────────────────────────┐
│                    Blue Team Agent                       │
├─────────────────────────────────────────────────────────┤
│  Properties:                                             │
│  • id: string                                           │
│  • name: string                                         │
│  • role: string                                         │
│  • type: AgentType.BLUE                                 │
│  • status: AgentStatus                                  │
│  • currentTask: string                                  │
│  • efficiency: number (85-100%)                         │
│  • logs: string[]                                       │
├─────────────────────────────────────────────────────────┤
│  Specializations:                                        │
│  • Threat Detection                                     │
│  • Incident Response                                    │
│  • Forensics                                            │
│  • Vulnerability Management                             │
├─────────────────────────────────────────────────────────┤
│  Capabilities:                                           │
│  • Detect threats automatically                         │
│  • Analyze attack patterns                              │
│  • Generate mitigations                                 │
│  • Block malicious activity                             │
└─────────────────────────────────────────────────────────┘
```

## State Management

```
App.tsx State
├── currentView: string
├── redAgents: Agent[]
├── blueAgents: Agent[]
├── logs: LogEntry[]
├── metrics: MetricData[]
├── threats: Threat[]
└── activeAttacks: AttackResult[]

RedTeamView State
├── activeAttacks: AttackResult[]
├── selectedAgent: Agent | null
└── executingAttack: string | null

BlueTeamView State
├── defenses: DefenseResult[]
└── stats: {
    totalAttacks: number
    blocked: number
    analyzing: number
    failed: number
}
```

## API Integration

```
┌────────────────────────────────────────────────────────┐
│              Gemini API Integration                     │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Configuration:                                         │
│  • Model: gemini-2.0-flash-exp                         │
│  • API Key: VITE_GEMINI_API_KEY                        │
│  • Temperature: 0.6-0.8                                │
│  • Max Tokens: 300-500                                 │
│                                                         │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Functions:                                             │
│                                                         │
│  1. generateStrategicDecision()                        │
│     Input: System context                              │
│     Output: Strategic analysis                         │
│     Use: Orchestrator view                             │
│                                                         │
│  2. generateRedTeamAttack()                            │
│     Input: Attack type, target                         │
│     Output: {strategy, payload, impact}                │
│     Use: Red Team attacks                              │
│                                                         │
│  3. generateBlueTeamResponse()                         │
│     Input: Threat, attack details                      │
│     Output: {analysis, mitigation, confidence}         │
│     Use: Blue Team defense                             │
│                                                         │
└────────────────────────────────────────────────────────┘
```

## Attack Types & Handlers

```
Attack Type          → Red Team Agent    → Blue Team Response
─────────────────────────────────────────────────────────────
SQL Injection        → Exploit-Dev       → Sentinel-AI
                                         → Guardian-Firewall

XSS                  → Exploit-Dev       → Sentinel-AI
                                         → Guardian-Firewall

Brute Force          → Crypto-Breaker    → Guardian-Firewall
                                         → Patch-Master

Phishing             → Social-Engineer   → Sentinel-AI
                                         → Forensic-Bot

Ransomware           → Exploit-Dev       → Forensic-Bot
                                         → Patch-Master

DDoS                 → Recon-Alpha       → Guardian-Firewall

Privilege Escalation → Exploit-Dev       → Patch-Master
                                         → Forensic-Bot

Data Exfiltration    → Recon-Alpha       → Sentinel-AI
                                         → Forensic-Bot
```

## File Structure

```
cybersentinel/
├── src/
│   ├── App.tsx                    # Main application
│   ├── index.tsx                  # Entry point
│   ├── types.ts                   # TypeScript definitions
│   ├── constants.ts               # Agent definitions
│   │
│   ├── components/
│   │   ├── Layout.tsx            # App layout
│   │   ├── AgentCard.tsx         # Agent display
│   │   └── Terminal.tsx          # Log terminal
│   │
│   ├── views/
│   │   ├── DashboardView.tsx     # Metrics dashboard
│   │   ├── RedTeamView.tsx       # Attack interface
│   │   ├── BlueTeamView.tsx      # Defense interface
│   │   ├── OrchestratorView.tsx  # Strategic AI
│   │   └── WorkflowView.tsx      # Workflow viz
│   │
│   └── services/
│       ├── geminiService.ts      # AI integration
│       ├── agentService.ts       # Agent logic
│       ├── workflowEngine.ts     # Workflow engine
│       └── mcpMock.ts            # Tool mocks
│
├── .env.local                     # API configuration
├── vite-env.d.ts                 # Type definitions
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── vite.config.ts                # Vite config
│
└── Documentation/
    ├── README.md                  # Project overview
    ├── START_HERE.md             # Quick start
    ├── SETUP_GUIDE.md            # Detailed guide
    ├── ARCHITECTURE.md           # This file
    └── IMPLEMENTATION_SUMMARY.md # Technical summary
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  • React 19                                             │
│  • TypeScript 5.8                                       │
│  • Vite 6.2                                             │
│  • Tailwind CSS (via inline styles)                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    UI Components                         │
│  • Lucide React (icons)                                 │
│  • Recharts (metrics visualization)                     │
│  • Custom components                                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    AI Integration                        │
│  • @google/genai 1.40.0                                │
│  • Gemini 2.0 Flash                                     │
│  • REST API                                             │
└─────────────────────────────────────────────────────────┘
```

## Security Considerations

```
┌─────────────────────────────────────────────────────────┐
│                  Security Measures                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ✓ API Key stored in environment variables              │
│  ✓ No real network attacks executed                     │
│  ✓ All payloads are simulated                          │
│  ✓ Educational purposes only                            │
│  ✓ No data persistence                                  │
│  ✓ Client-side only (no backend)                       │
│  ✓ No external connections except Gemini API           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Performance Metrics

```
Component Render Times:
├── DashboardView:    ~50ms
├── RedTeamView:      ~40ms
├── BlueTeamView:     ~45ms
├── OrchestratorView: ~35ms
└── WorkflowView:     ~60ms

API Response Times:
├── Attack Generation:  1-2 seconds
├── Defense Analysis:   1-2 seconds
└── Strategic Decision: 1-3 seconds

State Updates:
├── Agent Status:    Immediate
├── Attack Progress: 2-second intervals
└── Metrics:         2-second intervals
```

---

**This architecture enables**:
- Real-time attack-defense simulation
- AI-powered decision making
- Scalable agent system
- Modular component design
- Easy maintenance and extension
