import { useState, useEffect, useMemo } from "react";
import { Zap, Shield, Database, Server, Activity } from "lucide-react";

// Node positions for the workflow graph
const NODE_POSITIONS = {
  "threat-intel": { x: 50,  y: 200 },
  "red-agent":    { x: 250, y: 200 },
  "target":       { x: 450, y: 200 },
  "blue-agent":   { x: 650, y: 200 },
  "soc":          { x: 850, y: 200 },
};

const NODE_W = 140, NODE_H = 70;

export default function WorkflowView({ attacks, defenses, redAgents, blueAgents }) {
  const [activeFlow, setActiveFlow] = useState(null);

  // Build live workflow from latest attack/defense pair
  const liveWorkflow = useMemo(() => {
    if (!attacks.length) return null;
    
    const latestAttack = attacks[attacks.length - 1];
    const relatedDefense = defenses.find(d => d.attack_id === latestAttack.id);

    return {
      attack: latestAttack,
      defense: relatedDefense,
      redAgent: latestAttack.agent_name,
      blueAgent: relatedDefense?.agent_name || "Pending...",
      nodes: [
        { id: "threat-intel", label: "Threat Intel",     sub: "Data Source",   icon: Database, status: "done",    color: "purple" },
        { id: "red-agent",    label: latestAttack.agent_name, sub: "Red Team",  icon: Zap,      status: getAttackNodeStatus(latestAttack), color: "red" },
        { id: "target",       label: latestAttack.target.split(" ")[0], sub: "Target System", icon: Server, status: latestAttack.status === "DETECTED" || latestAttack.status === "BLOCKED" ? "done" : "active", color: "slate" },
        { id: "blue-agent",   label: relatedDefense?.agent_name || "Detecting...", sub: "Blue Team", icon: Shield, status: getDefenseNodeStatus(relatedDefense), color: "blue" },
        { id: "soc",          label: "SOC Dashboard",   sub: "Analyst View",  icon: Activity, status: relatedDefense?.status === "BLOCKED" || relatedDefense?.status === "FAILED" ? "done" : "idle", color: "green" },
      ],
    };
  }, [attacks, defenses]);

  useEffect(() => {
    if (liveWorkflow) setActiveFlow(liveWorkflow);
  }, [liveWorkflow]);

  if (!activeFlow) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-900/50 border border-slate-800 rounded-xl">
        <div className="text-center">
          <Activity size={48} className="text-slate-600 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-400 font-mono">Waiting for attack activity...</p>
          <p className="text-slate-600 text-sm mt-2">Backend must be running on port 8000</p>
        </div>
      </div>
    );
  }

  const { attack, defense, nodes } = activeFlow;

  return (
    <div className="flex gap-4 h-[calc(100vh-10rem)]">
      {/* Canvas */}
      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl relative overflow-hidden">
        {/* Grid */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(#334155 1px,transparent 1px),linear-gradient(90deg,#334155 1px,transparent 1px)",
          backgroundSize: "30px 30px"
        }} />

        {/* Title */}
        <div className="absolute top-4 left-4 z-20 bg-slate-950/90 border border-slate-700 rounded-lg px-4 py-2">
          <p className="text-xs text-slate-400">
            <span className="text-white font-bold">Live:</span> {attack.type} → {defense ? defense.status : "Detecting..."}
          </p>
        </div>

        {/* SVG edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker id="arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="#64748b" />
            </marker>
            <marker id="arr-active" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="#10b981" />
            </marker>
          </defs>
          {["threat-intel→red-agent", "red-agent→target", "target→blue-agent", "blue-agent→soc"].map((edge, i) => {
            const [from, to] = edge.split("→");
            const s = NODE_POSITIONS[from], t = NODE_POSITIONS[to];
            const sNode = nodes.find(n => n.id === from);
            const active = sNode?.status === "active" || sNode?.status === "done";
            const x1 = s.x + NODE_W, y1 = s.y + NODE_H / 2;
            const x2 = t.x,          y2 = t.y + NODE_H / 2;
            return (
              <path key={i}
                d={`M${x1},${y1} C${x1+50},${y1} ${x2-50},${y2} ${x2},${y2}`}
                fill="none"
                stroke={active ? "#10b981" : "#475569"}
                strokeWidth={active ? 3 : 2}
                markerEnd={active ? "url(#arr-active)" : "url(#arr)"}
                opacity={active ? 1 : 0.4}
                className={active ? "animate-pulse" : ""}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map(n => {
          const pos = NODE_POSITIONS[n.id];
          const Icon = n.icon;
          const borderColors = {
            active:  "#facc15",
            done:    { red: "#ef4444", blue: "#3b82f6", purple: "#8b5cf6", green: "#10b981", slate: "#64748b" }[n.color],
            idle:    "#1e293b",
          };
          return (
            <div
              key={n.id}
              className={`absolute rounded-lg border-2 flex flex-col justify-center px-4 transition-all duration-300 ${
                n.status === "active" ? "scale-110 bg-slate-800 shadow-2xl" :
                n.status === "done"   ? "bg-slate-900/80" : "bg-slate-950"
              }`}
              style={{
                left: pos.x, top: pos.y, width: NODE_W, height: NODE_H,
                borderColor: borderColors[n.status] || borderColors.idle,
                boxShadow: n.status === "active" ? `0 0 30px rgba(250,204,21,0.4)` : "none",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon size={18} className="text-white" />
                <span className="text-sm font-bold text-white truncate">{n.label}</span>
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">{n.sub}</div>
              {n.status === "active" && (
                <div className="text-[9px] text-yellow-400 font-mono animate-pulse mt-1">● executing</div>
              )}
              {n.status === "done" && (
                <div className="text-[9px] text-emerald-400 font-mono mt-1">✓ complete</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Details panel */}
      <div className="w-80 flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-400 tracking-wider">
          LIVE WORKFLOW DETAILS
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {/* Attack */}
          <div className="bg-red-950/20 border border-red-900/40 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-red-400" />
              <span className="font-bold text-red-400 text-xs uppercase">Attack</span>
              <StatusBadge status={attack.status} />
            </div>
            <div className="text-xs text-white font-bold mb-1">{attack.type}</div>
            <div className="text-xs text-slate-400 mb-2">{attack.agent_name} → {attack.target}</div>
            <div className="text-xs text-slate-300 leading-relaxed">{attack.strategy}</div>
            <div className="mt-2 p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[10px] text-slate-500 break-all">
              {attack.payload}
            </div>
            {attack.rag_sources_used?.length > 0 && (
              <div className="mt-2 flex gap-1 flex-wrap">
                {attack.rag_sources_used.map(s => (
                  <span key={s} className="text-[9px] px-1 py-0.5 bg-purple-900/30 text-purple-400 rounded font-mono">{s}</span>
                ))}
              </div>
            )}
          </div>

          {/* Defense */}
          {defense ? (
            <div className="bg-blue-950/20 border border-blue-900/40 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={14} className="text-blue-400" />
                <span className="font-bold text-blue-400 text-xs uppercase">Defense</span>
                <StatusBadge status={defense.status} />
              </div>
              <div className="text-xs text-white font-bold mb-1">{defense.agent_name}</div>
              <div className="text-xs text-slate-400 mb-2">Confidence: {defense.confidence}%</div>
              <div className="text-xs text-slate-300 leading-relaxed mb-2">{defense.analysis}</div>
              <div className="text-xs text-blue-300 leading-relaxed">{defense.mitigation}</div>
              {defense.rag_sources_used?.length > 0 && (
                <div className="mt-2 flex gap-1 flex-wrap">
                  {defense.rag_sources_used.map(s => (
                    <span key={s} className="text-[9px] px-1 py-0.5 bg-purple-900/30 text-purple-400 rounded font-mono">{s}</span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-500 italic">Blue Team analyzing...</div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Timeline</div>
            <div className="space-y-1.5">
              {attack.logs?.map((log, i) => (
                <div key={i} className="text-xs text-slate-400 font-mono">{log}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent attacks */}
        <div className="border-t border-slate-800 p-3 bg-slate-900/50">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recent Attacks</div>
          <div className="space-y-1">
            {attacks.slice(-5).reverse().map(a => (
              <div key={a.id} className="flex items-center gap-2 text-[10px]">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  a.status === "BLOCKED" ? "bg-green-500" : a.status === "SUCCESS" ? "bg-red-500" : "bg-yellow-500"
                }`} />
                <span className="text-slate-400 truncate flex-1">{a.type}</span>
                <span className={`shrink-0 font-mono ${
                  a.status === "BLOCKED" ? "text-green-400" : a.status === "SUCCESS" ? "text-red-400" : "text-yellow-400"
                }`}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getAttackNodeStatus(attack) {
  if (attack.status === "BLOCKED" || attack.status === "SUCCESS") return "done";
  if (attack.status === "DETECTED") return "done";
  return "active";
}

function getDefenseNodeStatus(defense) {
  if (!defense) return "idle";
  if (defense.status === "BLOCKED" || defense.status === "FAILED") return "done";
  return "active";
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
