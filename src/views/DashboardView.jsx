import { useMemo, useState, useEffect } from "react";
import { Shield, Skull, Activity, CheckCircle, Clock, Zap } from "lucide-react";

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export default function DashboardView({ attacks, defenses, logs, redAgents, blueAgents, analyst }) {
  const isLead = analyst?.role?.includes("Lead");
  const now    = useLiveClock();
  
  const stats = useMemo(() => {
    const blocked = defenses.filter(d => d.status === "BLOCKED").length;
    const failed  = defenses.filter(d => d.status === "FAILED").length;
    const active  = attacks.filter(a => ["INITIATED","IN_PROGRESS","DETECTED"].includes(a.status)).length;
    const rate    = defenses.length ? Math.round(blocked / defenses.length * 100) : 0;
    return { blocked, failed, active, rate, total: attacks.length };
  }, [attacks, defenses]);

  const recentActivity = useMemo(() => {
    const all = [
      ...attacks.map(a => ({ ...a, kind: "attack",  ts: a.timestamp })),
      ...defenses.map(d => ({ ...d, kind: "defense", ts: d.timestamp })),
    ].sort((a, b) => b.ts - a.ts).slice(0, 10);
    return all;
  }, [attacks, defenses]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">
          {isLead ? "SecOps Lead Dashboard" : "SOC Analyst Dashboard"}
        </h2>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-slate-400 text-sm">
            {isLead ? "Full system visibility — Gemini 3 agents running" : "Read-only monitoring — Real-time feed"}
          </p>
          <span className="text-slate-600 text-xs font-mono ml-auto">
            {now.toLocaleTimeString()} · {now.toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Skull}       label="Total Attacks"  value={stats.total}      color="red"    />
        <StatCard icon={CheckCircle} label="Blocked"        value={stats.blocked}    color="green"  />
        <StatCard icon={Activity}    label="Active Threats" value={stats.active}     color="yellow" />
        <StatCard icon={Shield}      label="Block Rate"     value={`${stats.rate}%`} color="blue"   />
      </div>

      {/* Lead-only: Orchestrator quick panel */}
      {isLead && (
        <div className="bg-gradient-to-r from-purple-950/30 to-slate-900/50 border border-purple-900/40 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span className="font-bold text-purple-400">Gemini 3.1 Pro — Orchestrator Access</span>
              <span className="text-xs text-slate-500 font-mono border border-slate-700 px-2 py-0.5 rounded">LEAD ONLY</span>
            </div>
            <a href="#" onClick={e => { e.preventDefault(); window.dispatchEvent(new CustomEvent("navigate", { detail: "orchestrator" })); }}
              className="text-xs text-purple-400 hover:text-purple-300 font-mono border border-purple-900/50 px-3 py-1.5 rounded-lg hover:bg-purple-900/20 transition-all">
              Open Orchestrator →
            </a>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-500 mb-1">Agent Model</div>
              <div className="text-green-400">gemini-3-flash</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-500 mb-1">Orchestrator</div>
              <div className="text-purple-400">gemini-3.1-pro</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-500 mb-1">RAG Engine</div>
              <div className="text-blue-400">ChromaDB + MiniLM</div>
            </div>
          </div>
        </div>
      )}

      {/* Agents */}
      <div className="grid grid-cols-2 gap-6">
        {/* Red Team — read-only, autonomous */}
        <div className="bg-slate-900/50 border border-red-900/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Skull size={16} className="text-red-400" />
            <h3 className="font-bold text-red-400">Red Team Agents</h3>
            <span className="ml-auto text-[10px] text-slate-500 font-mono bg-red-950/30 px-2 py-0.5 rounded border border-red-900/30">
              AUTONOMOUS
            </span>
          </div>
          <div className="space-y-2">
            {redAgents.length === 0 && (
              <p className="text-slate-600 text-sm italic">Connecting to backend...</p>
            )}
            {redAgents.map(a => (
              <AgentRow key={a.id} agent={a} color="red" defenses={[]} />
            ))}
          </div>
        </div>

        {/* Blue Team */}
        <div className="bg-slate-900/50 border border-blue-900/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-blue-400" />
            <h3 className="font-bold text-blue-400">Blue Team Agents</h3>
            <span className="ml-auto text-[10px] text-emerald-400 font-mono">● ACTIVE</span>
          </div>
          <div className="space-y-2">
            {blueAgents.length === 0 && (
              <p className="text-slate-600 text-sm italic">Connecting to backend...</p>
            )}
            {blueAgents.map(a => (
              <AgentRow key={a.id} agent={a} color="blue" defenses={defenses} />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />Recent Activity
        </h3>
        {recentActivity.length === 0 ? (
          <p className="text-slate-600 text-sm italic">
            Waiting for agent activity... (backend must be running)
          </p>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  item.kind === "attack" ? "bg-red-500" : "bg-blue-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">
                      {item.kind === "attack" ? item.type : item.agent_name}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {item.kind === "attack" ? item.strategy : item.mitigation}
                  </p>
                  {/* RAG sources */}
                  {item.rag_sources_used?.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {item.rag_sources_used.slice(0, 3).map(s => (
                        <span key={s} className="text-[9px] px-1 py-0.5 bg-purple-900/30 text-purple-400 rounded font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-600 font-mono shrink-0">
                  {new Date(item.ts * 1000).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Log Terminal */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/40 border border-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/40 border border-green-500/60" />
          </div>
          <span className="text-slate-400 text-xs font-mono font-bold ml-2">LIVE SYSTEM LOGS</span>
          <span className="ml-auto text-xs text-slate-600 font-mono">{logs.length} entries</span>
        </div>
        <div className="p-4 h-52 overflow-y-auto space-y-1 font-mono text-xs">
          {logs.length === 0 && (
            <span className="text-slate-600 italic">
              No logs yet — start the backend: uvicorn backend.main:app --reload --port 8000
            </span>
          )}
          {logs.map(l => (
            <div key={l.id} className="flex gap-2 hover:bg-slate-900/30 px-1 rounded">
              <span className="text-slate-600 shrink-0">[{l.timestamp}]</span>
              <span className={`font-bold shrink-0 ${
                l.agentType === "RED"          ? "text-red-400" :
                l.agentType === "BLUE"         ? "text-blue-400" :
                l.agentType === "ORCHESTRATOR" ? "text-purple-400" : "text-slate-400"
              }`}>{l.source}:</span>
              <span className={
                l.level === "CRITICAL" ? "text-red-400 font-bold" :
                l.level === "SUCCESS"  ? "text-green-400" :
                l.level === "WARN"     ? "text-yellow-400" : "text-slate-300"
              }>{l.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const c = {
    red:    { border: "border-red-900/50",    text: "text-red-400"    },
    green:  { border: "border-green-900/50",  text: "text-green-400"  },
    yellow: { border: "border-yellow-900/50", text: "text-yellow-400" },
    blue:   { border: "border-blue-900/50",   text: "text-blue-400"   },
  }[color];
  return (
    <div className={`bg-slate-900/50 border rounded-xl p-5 ${c.border}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-sm">{label}</span>
        <Icon size={20} className={c.text} />
      </div>
      <div className={`text-3xl font-bold ${c.text}`}>{value}</div>
    </div>
  );
}

function AgentRow({ agent, color, defenses }) {
  const statusColor = {
    IDLE:       "text-slate-500",
    EXECUTING:  color === "red" ? "text-red-400" : "text-blue-400",
    ANALYZING:  "text-yellow-400",
    MITIGATING: "text-blue-400",
    PLANNING:   "text-purple-400",
  }[agent.status] || "text-slate-400";

  // Real success rate from actual defense operations
  const agentDefenses = defenses?.filter(d => d.agent_name === agent.name) || [];
  const blocked = agentDefenses.filter(d => d.status === "BLOCKED").length;
  const total   = agentDefenses.length;
  const realRate = total > 0 ? Math.round(blocked / total * 100) : agent.efficiency;
  const barColor = color === "red" ? "bg-red-500" : realRate >= 80 ? "bg-blue-500" : realRate >= 50 ? "bg-yellow-500" : "bg-red-500";

  // Show unique capabilities per agent
  const caps = agent.capabilities?.slice(0, 2).map(c => c.name).join(", ") || "";

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/50">
      <div className={`w-2 h-2 rounded-full shrink-0 ${
        agent.status === "IDLE"
          ? "bg-slate-600"
          : color === "red"
          ? "bg-red-500 animate-pulse"
          : "bg-blue-500 animate-pulse"
      }`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-white">{agent.name}</div>
        <div className="text-[10px] text-slate-500 truncate">{caps}</div>
        <div className="mt-1.5 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
            style={{ width: `${realRate}%` }}
          />
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className={`text-xs font-mono ${statusColor}`}>{agent.status}</div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          {total > 0 ? `${blocked}/${total} blocked` : `${agent.efficiency}%`}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    BLOCKED:     "bg-green-900/30 text-green-400",
    FAILED:      "bg-red-900/30 text-red-400",
    DETECTED:    "bg-orange-900/30 text-orange-400",
    IN_PROGRESS: "bg-yellow-900/30 text-yellow-400",
    INITIATED:   "bg-slate-800 text-slate-400",
    ANALYZING:   "bg-blue-900/30 text-blue-400",
    MITIGATING:  "bg-blue-900/30 text-blue-400",
    SUCCESS:     "bg-red-900/30 text-red-400",
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${map[status] || "bg-slate-800 text-slate-400"}`}>
      {status}
    </span>
  );
}
