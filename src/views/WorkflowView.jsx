import { useState, useRef } from "react";
import { Play, RotateCcw } from "lucide-react";

const INITIAL_NODES = [
  { id: "threat-intel", label: "Threat Intel", sub: "Data Source",   x: 40,  y: 180, color: "purple", status: "idle" },
  { id: "recon",        label: "Recon-Alpha",  sub: "Red Agent",     x: 220, y: 80,  color: "red",    status: "idle" },
  { id: "exploit",      label: "Exploit-Dev",  sub: "Red Agent",     x: 220, y: 280, color: "red",    status: "idle" },
  { id: "target",       label: "Target System",sub: "Enterprise",    x: 420, y: 180, color: "slate",  status: "idle" },
  { id: "sentinel",     label: "Sentinel-AI",  sub: "Blue Agent",    x: 620, y: 80,  color: "blue",   status: "idle" },
  { id: "guardian",     label: "Guardian-FW",  sub: "Blue Agent",    x: 620, y: 280, color: "blue",   status: "idle" },
  { id: "soc-log",      label: "SOC Logs",     sub: "Analyst View",  x: 820, y: 180, color: "green",  status: "idle" },
];

const EDGES = [
  { from: "threat-intel", to: "recon"    },
  { from: "threat-intel", to: "exploit"  },
  { from: "recon",        to: "target"   },
  { from: "exploit",      to: "target"   },
  { from: "target",       to: "sentinel" },
  { from: "target",       to: "guardian" },
  { from: "sentinel",     to: "soc-log"  },
  { from: "guardian",     to: "soc-log"  },
];

const SEQUENCE = [
  { id: "threat-intel", log: "Threat intel feed ingested" },
  { id: "recon",        log: "Recon-Alpha: scanning target subnet 192.168.1.0/24" },
  { id: "exploit",      log: "Exploit-Dev: crafting SQL injection payload" },
  { id: "target",       log: "Target system: attack detected on /api/login" },
  { id: "sentinel",     log: "Sentinel-AI: anomaly detected — CRITICAL" },
  { id: "guardian",     log: "Guardian-FW: WAF rule deployed, IP blocked" },
  { id: "soc-log",      log: "SOC: incident logged, analyst notified" },
];

const NODE_W = 130, NODE_H = 56;

export default function WorkflowView({ attacks, defenses }) {
  const [nodes, setNodes]   = useState(INITIAL_NODES);
  const [logs, setLogs]     = useState([]);
  const [running, setRunning] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset]   = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const setStatus = (id, status) =>
    setNodes(prev => prev.map(n => n.id === id ? { ...n, status } : n));

  const addLog = (msg) =>
    setLogs(prev => [{ id: Date.now(), msg, ts: new Date().toLocaleTimeString() }, ...prev].slice(0, 20));

  const run = async () => {
    if (running) return;
    setRunning(true);
    setLogs([]);
    setNodes(INITIAL_NODES);

    for (const step of SEQUENCE) {
      setStatus(step.id, "running");
      addLog(step.log);
      await new Promise(r => setTimeout(r, 1200));
      setStatus(step.id, "done");
    }
    setRunning(false);
  };

  const reset = () => {
    setNodes(INITIAL_NODES);
    setLogs([]);
    setRunning(false);
  };

  // Drag handlers
  const onMouseDown = (e, id) => {
    const node = nodes.find(n => n.id === id);
    setDragging(id);
    setOffset({ x: e.clientX - node.x, y: e.clientY - node.y });
    e.preventDefault();
  };

  const onMouseMove = (e) => {
    if (!dragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - offset.x, rect.width - NODE_W));
    const y = Math.max(0, Math.min(e.clientY - rect.top - offset.y, rect.height - NODE_H));
    setNodes(prev => prev.map(n => n.id === dragging ? { ...n, x, y } : n));
  };

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  const borderColor = { red: "#ef4444", blue: "#3b82f6", purple: "#8b5cf6", green: "#10b981", slate: "#475569" };
  const glowColor   = { red: "rgba(239,68,68,0.3)", blue: "rgba(59,130,246,0.3)", purple: "rgba(139,92,246,0.3)", green: "rgba(16,185,129,0.3)", slate: "rgba(71,85,105,0.2)" };

  return (
    <div className="flex gap-4 h-[calc(100vh-10rem)]">
      {/* Canvas */}
      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl relative overflow-hidden">
        {/* Grid */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(#334155 1px,transparent 1px),linear-gradient(90deg,#334155 1px,transparent 1px)",
          backgroundSize: "30px 30px"
        }} />

        {/* Controls */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button onClick={run} disabled={running}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${running ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500 text-white"}`}>
            <Play size={14} />{running ? "Running..." : "Execute"}
          </button>
          <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm bg-slate-700 hover:bg-slate-600 text-white transition-all">
            <RotateCcw size={14} />Reset
          </button>
        </div>

        <div className="absolute top-4 left-4 z-20 bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-1.5">
          <p className="text-xs text-slate-400">💡 Drag nodes · Click Execute to simulate</p>
        </div>

        {/* SVG edges */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          onMouseMove={onMouseMove}
          onMouseUp={() => setDragging(null)}
          onMouseLeave={() => setDragging(null)}
        >
          <defs>
            <marker id="arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="#475569" />
            </marker>
            <marker id="arr-active" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="#10b981" />
            </marker>
          </defs>
          {EDGES.map((e, i) => {
            const s = nodeMap[e.from], t = nodeMap[e.to];
            if (!s || !t) return null;
            const x1 = s.x + NODE_W, y1 = s.y + NODE_H / 2;
            const x2 = t.x,          y2 = t.y + NODE_H / 2;
            const active = s.status === "running" || s.status === "done";
            return (
              <path key={i}
                d={`M${x1},${y1} C${x1+40},${y1} ${x2-40},${y2} ${x2},${y2}`}
                fill="none"
                stroke={active ? "#10b981" : "#334155"}
                strokeWidth={active ? 2 : 1.5}
                markerEnd={active ? "url(#arr-active)" : "url(#arr)"}
                opacity={active ? 1 : 0.5}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map(n => (
          <div
            key={n.id}
            className={`rounded-lg border-2 cursor-grab active:cursor-grabbing select-none transition-all duration-300 flex flex-col justify-center px-3 ${
              n.status === "running" ? "scale-110 bg-slate-800" :
              n.status === "done"    ? "bg-slate-900/80" : "bg-slate-950"
            }`}
            style={{
              left: n.x, top: n.y, width: NODE_W, height: NODE_H, position: "absolute",
              borderColor: n.status === "running" ? "#facc15" : n.status === "done" ? borderColor[n.color] : "#1e293b",
              boxShadow: n.status === "running" ? `0 0 20px ${glowColor[n.color]}` : "none",
            }}
            onMouseDown={(e) => onMouseDown(e, n.id)}
          >
            <div className="text-xs font-bold text-white truncate">{n.label}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">{n.sub}</div>
            {n.status === "running" && (
              <div className="text-[9px] text-yellow-400 font-mono animate-pulse mt-0.5">● executing</div>
            )}
            {n.status === "done" && (
              <div className="text-[9px] text-emerald-400 font-mono mt-0.5">✓ done</div>
            )}
          </div>
        ))}
      </div>

      {/* Log panel */}
      <div className="w-72 flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-400 tracking-wider">
          WORKFLOW LOGS
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs">
          {logs.length === 0 && <span className="text-slate-600 italic">Click Execute to run...</span>}
          {logs.map(l => (
            <div key={l.id} className="p-2 bg-slate-900/50 rounded border border-slate-800">
              <div className="text-slate-600 text-[10px] mb-0.5">{l.ts}</div>
              <div className="text-slate-300">{l.msg}</div>
            </div>
          ))}
        </div>

        {/* Live attacks from backend */}
        {attacks?.length > 0 && (
          <div className="border-t border-slate-800 p-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Live Attacks</div>
            <div className="space-y-1">
              {attacks.slice(-3).reverse().map(a => (
                <div key={a.id} className="text-[10px] flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                  <span className="text-slate-400 truncate">{a.type}</span>
                  <span className={`ml-auto shrink-0 ${a.status === "BLOCKED" ? "text-green-400" : "text-red-400"}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
