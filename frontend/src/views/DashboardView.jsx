import { useMemo } from "react";
import { Shield, Skull, Activity, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";

export default function DashboardView({ attacks, defenses, logs, redAgents, blueAgents }) {
  const stats = useMemo(() => {
    const blocked  = defenses.filter(d => d.status === "BLOCKED").length;
    const failed   = defenses.filter(d => d.status === "FAILED").length;
    const active   = attacks.filter(a => ["INITIATED","IN_PROGRESS","DETECTED"].includes(a.status)).length;
    const rate     = defenses.length ? Math.round(blocked / defenses.length * 100) : 0;
    return { blocked, failed, active, rate, total: attacks.length };
  }, [attacks, defenses]);

  const recentActivity = useMemo(() =>
    [...attacks.slice(-5).map(a => ({ ...a, kind: "attack" })),
     ...defenses.slice(-5).map(d => ({ ...d, kind: "defense" }))]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8),
  [attacks, defenses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">SOC Dashboard</h2>
        <p className="text-slate-400 text-sm mt-1">Real-time security operations — Red Team running autonomously</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Skull}         label="Total Attacks"   value={stats.total}   color="red"   />
        <StatCard icon={CheckCircle}   label="Blocked"         value={stats.blocked} color="green" />
        <StatCard icon={Activity}      label="Active Threats"  value={stats.active}  color="yellow"/>
        <StatCard icon={Shield}        label="Block Rate"      value={`${stats.rate}%`} color="blue" />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-6">

        {/* Red Team Agents (read-only) */}
        <div className="bg-slate-900/50 border border-red-900/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Skull size={18} className="text-red-400" />
            <h3 className="font-bold text-red-400">Red Team Agents</h3>
            <span className="ml-auto text-xs text-slate-500 font-mono">autonomous</span>
          </div>
          <div className="space-y-2">
            {redAgents.map(a => (
              <AgentRow key={a.id} agent={a} color="red" />
            ))}
            {redAgents.length === 0 && <p className="text-slate-600 text-sm italic">Connecting to agents...</p>}
          </div>
        </div>

        {/* Blue Team Agents */}
        <div className="bg-slate-900/50 border border-blue-900/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-blue-400" />
            <h3 className="font-bold text-blue-400">Blue Team Agents</h3>
            <span className="ml-auto text-xs text-emerald-400 font-mono">● active</span>
          </div>
          <div className="space-y-2">
            {blueAgents.map(a => (
              <AgentRow key={a.id} agent={a} color="blue" />
            ))}
            {blueAgents.length === 0 && <p className="text-slate-600 text-sm italic">Connecting to agents...</p>}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />
          Recent Activity
        </h3>
        <div className="space-y-2">
          {recentActivity.length === 0 && (
            <p className="text-slate-600 text-sm italic">Waiting for agent activity...</p>
          )}
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                item.kind === "attack" ? "bg-red-500" : "bg-blue-500"
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    {item.kind === "attack" ? item.type : item.agent_name}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                    item.status === "BLOCKED"     ? "bg-green-900/30 text-green-400" :
                    item.status === "FAILED"      ? "bg-red-900/30 text-red-400" :
                    item.status === "DETECTED"    ? "bg-orange-900/30 text-orange-400" :
                    item.status === "IN_PROGRESS" ? "bg-yellow-900/30 text-yellow-400" :
                    "bg-slate-800 text-slate-400"
                  }`}>{item.status}</span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {item.kind === "attack" ? item.strategy : item.mitigation}
                </p>
              </div>
              <span className="text-xs text-slate-600 font-mono shrink-0">
                {new Date(item.timestamp * 1000).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
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
        </div>
        <div className="p-4 h-48 overflow-y-auto space-y-1 font-mono text-xs">
          {logs.length === 0 && <span className="text-slate-600 italic">Awaiting events...</span>}
          {logs.slice(0, 30).map(l => (
            <div key={l.id} className="flex gap-2">
              <span className="text-slate-600 shrink-0">[{l.timestamp}]</span>
              <span className={`font-bold shrink-0 ${
                l.agentType === "RED"         ? "text-red-400" :
                l.agentType === "BLUE"        ? "text-blue-400" :
                l.agentType === "ORCHESTRATOR"? "text-purple-400" : "text-slate-400"
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
  const colors = {
    red:    "border-red-900/50 text-red-400",
    green:  "border-green-900/50 text-green-400",
    yellow: "border-yellow-900/50 text-yellow-400",
    blue:   "border-blue-900/50 text-blue-400",
  };
  return (
    <div className={`bg-slate-900/50 border rounded-xl p-5 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-sm">{label}</span>
        <Icon size={20} />
      </div>
      <div className={`text-3xl font-bold ${colors[color].split(" ")[1]}`}>{value}</div>
    </div>
  );
}

function AgentRow({ agent, color }) {
  const statusColor = {
    IDLE:       "text-slate-500",
    EXECUTING:  color === "red" ? "text-red-400" : "text-blue-400",
    ANALYZING:  "text-yellow-400",
    MITIGATING: "text-blue-400",
    PLANNING:   "text-purple-400",
  }[agent.status] || "text-slate-400";

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-950/50">
      <div className={`w-2 h-2 rounded-full ${
        agent.status === "IDLE" ? "bg-slate-600" :
        color === "red" ? "bg-red-500 animate-pulse" : "bg-blue-500 animate-pulse"
      }`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-white">{agent.name}</div>
        <div className="text-xs text-slate-500 truncate">{agent.current_task}</div>
      </div>
      <span className={`text-xs font-mono ${statusColor}`}>{agent.status}</span>
    </div>
  );
}
