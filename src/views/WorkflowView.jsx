import { useState, useEffect } from "react";
import { Zap, Shield, Database, Server, Activity, Globe, Lock, Mail, Wifi, FileX, ShieldAlert } from "lucide-react";

const ICON_MAP = { Zap, Shield, Database, Server, Activity, Globe, Lock, Mail, Wifi, FileX, ShieldAlert };

const TOPOLOGIES = {
  "SQL Injection": {
    nodes: [
      { id:"attacker", label:"Exploit-Dev",   sub:"Red Agent",      icon:"Zap",         color:"red",    x:60,  y:180 },
      { id:"webapp",   label:"Web App",        sub:"Target",         icon:"Globe",       color:"slate",  x:260, y:180 },
      { id:"database", label:"Customer DB",    sub:"SQL Target",     icon:"Database",    color:"orange", x:460, y:180 },
      { id:"sentinel", label:"Sentinel-AI",    sub:"SIEM Detection", icon:"Shield",      color:"blue",   x:460, y:340 },
      { id:"guardian", label:"Guardian-FW",    sub:"WAF Block",      icon:"ShieldAlert", color:"blue",   x:260, y:340 },
      { id:"soc",      label:"SOC Dashboard",  sub:"Analyst",        icon:"Activity",    color:"green",  x:660, y:260 },
    ],
    edges: [
      {from:"attacker",to:"webapp",  label:"inject"},
      {from:"webapp",  to:"database",label:"query"},
      {from:"database",to:"sentinel",label:"alert"},
      {from:"sentinel",to:"guardian",label:"block"},
      {from:"sentinel",to:"soc",     label:"report"},
    ],
  },
  "Cross-Site Scripting": {
    nodes: [
      { id:"attacker", label:"Exploit-Dev",     sub:"Red Agent",   icon:"Zap",      color:"red",    x:60,  y:200 },
      { id:"webapp",   label:"Web App",          sub:"XSS Target",  icon:"Globe",    color:"slate",  x:280, y:100 },
      { id:"victim",   label:"Employee Browser", sub:"Victim",      icon:"Server",   color:"orange", x:280, y:300 },
      { id:"guardian", label:"Guardian-FW",      sub:"CSP Block",   icon:"Shield",   color:"blue",   x:500, y:200 },
      { id:"soc",      label:"SOC Dashboard",    sub:"Analyst",     icon:"Activity", color:"green",  x:700, y:200 },
    ],
    edges: [
      {from:"attacker",to:"webapp",  label:"inject script"},
      {from:"webapp",  to:"victim",  label:"execute"},
      {from:"victim",  to:"guardian",label:"CSP violation"},
      {from:"guardian",to:"soc",     label:"blocked"},
    ],
  },
  "Brute Force": {
    nodes: [
      { id:"attacker", label:"Crypto-Breaker", sub:"Red Agent",   icon:"Lock",        color:"red",   x:60,  y:200 },
      { id:"login",    label:"Login Portal",   sub:"Target",      icon:"Globe",       color:"slate", x:280, y:200 },
      { id:"guardian", label:"Guardian-FW",    sub:"Rate Limit",  icon:"Shield",      color:"blue",  x:500, y:100 },
      { id:"patch",    label:"Patch-Master",   sub:"MFA Enforce", icon:"ShieldAlert", color:"blue",  x:500, y:300 },
      { id:"soc",      label:"SOC Dashboard",  sub:"Analyst",     icon:"Activity",    color:"green", x:700, y:200 },
    ],
    edges: [
      {from:"attacker",to:"login",  label:"spray passwords"},
      {from:"login",   to:"guardian",label:"rate limit"},
      {from:"login",   to:"patch",  label:"MFA trigger"},
      {from:"guardian",to:"soc",    label:"blocked"},
      {from:"patch",   to:"soc",    label:"hardened"},
    ],
  },
  "Phishing Campaign": {
    nodes: [
      { id:"attacker", label:"Social-Engineer", sub:"Red Agent",   icon:"Mail",     color:"red",    x:60,  y:200 },
      { id:"email",    label:"Email Gateway",   sub:"Entry Point", icon:"Server",   color:"slate",  x:260, y:100 },
      { id:"employee", label:"Employee",        sub:"Target",      icon:"Globe",    color:"orange", x:260, y:300 },
      { id:"forensic", label:"Forensic-Bot",    sub:"IR Response", icon:"Shield",   color:"blue",   x:480, y:200 },
      { id:"soc",      label:"SOC Dashboard",   sub:"Analyst",     icon:"Activity", color:"green",  x:680, y:200 },
    ],
    edges: [
      {from:"attacker",to:"email",   label:"spearphish"},
      {from:"email",   to:"employee",label:"deliver"},
      {from:"employee",to:"forensic",label:"credential alert"},
      {from:"forensic",to:"soc",     label:"quarantine"},
    ],
  },
  "Ransomware Simulation": {
    nodes: [
      { id:"attacker", label:"Exploit-Dev",   sub:"Red Agent",     icon:"FileX",    color:"red",    x:60,  y:200 },
      { id:"endpoint", label:"File Server",   sub:"Target",        icon:"Server",   color:"slate",  x:260, y:200 },
      { id:"files",    label:"Critical Files",sub:"Encrypted",     icon:"Database", color:"orange", x:460, y:100 },
      { id:"backup",   label:"Backup System", sub:"Shadow Copies", icon:"Database", color:"orange", x:460, y:300 },
      { id:"forensic", label:"Forensic-Bot",  sub:"IR Response",   icon:"Shield",   color:"blue",   x:660, y:200 },
      { id:"soc",      label:"SOC Dashboard", sub:"Analyst",       icon:"Activity", color:"green",  x:860, y:200 },
    ],
    edges: [
      {from:"attacker",to:"endpoint",label:"deploy"},
      {from:"endpoint",to:"files",   label:"encrypt"},
      {from:"endpoint",to:"backup",  label:"delete shadows"},
      {from:"files",   to:"forensic",label:"EDR alert"},
      {from:"forensic",to:"soc",     label:"isolate"},
    ],
  },
  "DDoS Attack": {
    nodes: [
      { id:"botnet",   label:"Crypto-Breaker", sub:"Botnet C2",  icon:"Wifi",     color:"red",    x:60,  y:200 },
      { id:"cdn",      label:"CDN / Edge",     sub:"First Line", icon:"Globe",    color:"slate",  x:260, y:200 },
      { id:"api",      label:"API Gateway",    sub:"Target",     icon:"Server",   color:"orange", x:460, y:200 },
      { id:"guardian", label:"Guardian-FW",    sub:"Scrubbing",  icon:"Shield",   color:"blue",   x:460, y:360 },
      { id:"soc",      label:"SOC Dashboard",  sub:"Analyst",    icon:"Activity", color:"green",  x:660, y:280 },
    ],
    edges: [
      {from:"botnet",  to:"cdn",     label:"flood 50k/s"},
      {from:"cdn",     to:"api",     label:"overflow"},
      {from:"api",     to:"guardian",label:"rate limit"},
      {from:"guardian",to:"soc",     label:"mitigated"},
    ],
  },
  "Privilege Escalation": {
    nodes: [
      { id:"attacker", label:"Exploit-Dev",    sub:"Red Agent",   icon:"Zap",         color:"red",    x:60,  y:200 },
      { id:"shell",    label:"www-data Shell", sub:"Initial",     icon:"Server",      color:"slate",  x:260, y:200 },
      { id:"root",     label:"Root Access",    sub:"Escalated",   icon:"ShieldAlert", color:"orange", x:460, y:200 },
      { id:"patch",    label:"Patch-Master",   sub:"SUID Fix",    icon:"Shield",      color:"blue",   x:460, y:360 },
      { id:"forensic", label:"Forensic-Bot",   sub:"Attribution", icon:"Shield",      color:"blue",   x:660, y:200 },
      { id:"soc",      label:"SOC Dashboard",  sub:"Analyst",     icon:"Activity",    color:"green",  x:860, y:280 },
    ],
    edges: [
      {from:"attacker",to:"shell",  label:"exploit SUID"},
      {from:"shell",   to:"root",   label:"escalate"},
      {from:"root",    to:"patch",  label:"EDR alert"},
      {from:"root",    to:"forensic",label:"audit log"},
      {from:"patch",   to:"soc",    label:"patched"},
      {from:"forensic",to:"soc",    label:"report"},
    ],
  },
  "Data Exfiltration": {
    nodes: [
      { id:"attacker", label:"Crypto-Breaker", sub:"Red Agent",      icon:"Zap",      color:"red",    x:60,  y:200 },
      { id:"db",       label:"Customer DB",    sub:"Data Source",    icon:"Database", color:"slate",  x:260, y:200 },
      { id:"dns",      label:"DNS Tunnel",     sub:"Covert Channel", icon:"Globe",    color:"orange", x:460, y:200 },
      { id:"c2",       label:"Attacker C2",    sub:"Exfil Dest",     icon:"Server",   color:"red",    x:660, y:200 },
      { id:"sentinel", label:"Sentinel-AI",    sub:"DNS Monitor",    icon:"Shield",   color:"blue",   x:460, y:360 },
      { id:"soc",      label:"SOC Dashboard",  sub:"Analyst",        icon:"Activity", color:"green",  x:660, y:360 },
    ],
    edges: [
      {from:"attacker",to:"db",     label:"dump data"},
      {from:"db",      to:"dns",    label:"encode"},
      {from:"dns",     to:"c2",     label:"exfiltrate"},
      {from:"dns",     to:"sentinel",label:"anomaly"},
      {from:"sentinel",to:"soc",    label:"blocked"},
    ],
  },
};

const RED_NODES   = new Set(["attacker","botnet"]);
const BLUE_NODES  = new Set(["sentinel","guardian","forensic","patch"]);
const SOC_NODES   = new Set(["soc"]);

// Returns: "idle" | "active" | "done" | "failed"
function nodeStatus(id, attack, defense) {
  if (!attack) return "idle";

  if (RED_NODES.has(id)) {
    if (attack.status === "INITIATED")   return "active";
    if (attack.status === "SUCCESS")     return "done";   // attack succeeded = red node done (bad)
    return "done";
  }

  if (SOC_NODES.has(id)) {
    if (!defense) return "idle";
    if (defense.status === "BLOCKED")    return "done";
    if (defense.status === "FAILED")     return "failed";
    return "active";
  }

  if (BLUE_NODES.has(id)) {
    if (!defense) return "idle";
    if (defense.status === "ANALYZING")  return "active";
    if (defense.status === "MITIGATING") return "active";
    if (defense.status === "BLOCKED")    return "done";
    if (defense.status === "FAILED")     return "failed";
    return "idle";
  }

  // Target / intermediate nodes
  if (attack.status === "INITIATED")     return "idle";
  if (attack.status === "IN_PROGRESS")   return "active";
  if (attack.status === "DETECTED")      return "active";
  if (attack.status === "BLOCKED")       return "done";
  if (attack.status === "SUCCESS")       return "failed";  // attack succeeded = target compromised
  return "idle";
}

function edgeActive(edge, attack, defense) {
  if (!attack) return false;
  const isRed  = RED_NODES.has(edge.from);
  const isDef  = BLUE_NODES.has(edge.from) || BLUE_NODES.has(edge.to) || SOC_NODES.has(edge.to);
  if (isRed)  return ["IN_PROGRESS","DETECTED","BLOCKED","SUCCESS"].includes(attack.status);
  if (isDef)  return !!defense && ["ANALYZING","MITIGATING","BLOCKED","FAILED"].includes(defense.status);
  return ["DETECTED","BLOCKED","SUCCESS"].includes(attack.status);
}

// Border color per node state
function nodeBorderColor(status, nodeColor) {
  const BORDER = { red:"#ef4444", blue:"#3b82f6", green:"#10b981", slate:"#64748b", orange:"#f97316", purple:"#8b5cf6" };
  if (status === "active")  return "#facc15";
  if (status === "done")    return BORDER[nodeColor] || "#64748b";
  if (status === "failed")  return "#ef4444";
  return "#1e293b";
}

function nodeGlow(status, nodeColor) {
  const GLOW = { red:"239,68,68", blue:"59,130,246", green:"16,185,129", slate:"100,116,139", orange:"249,115,22" };
  if (status === "active")  return `0 0 24px rgba(250,204,21,0.5)`;
  if (status === "done")    return `0 0 16px rgba(${GLOW[nodeColor]||"100,116,139"},0.4)`;
  if (status === "failed")  return `0 0 24px rgba(239,68,68,0.6)`;
  return "none";
}

const NODE_W = 140, NODE_H = 64;

function StatusBadge({ status }) {
  const m = {
    BLOCKED:"bg-green-900/30 text-green-400", FAILED:"bg-red-900/30 text-red-400",
    DETECTED:"bg-orange-900/30 text-orange-400", IN_PROGRESS:"bg-yellow-900/30 text-yellow-400",
    INITIATED:"bg-slate-800 text-slate-400", ANALYZING:"bg-blue-900/30 text-blue-400",
    MITIGATING:"bg-blue-900/30 text-blue-400", SUCCESS:"bg-red-900/30 text-red-400",
  };
  return <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${m[status]||"bg-slate-800 text-slate-400"}`}>{status}</span>;
}

export default function WorkflowView({ attacks, defenses }) {
  const [selId, setSelId] = useState(null);

  // Auto-follow latest attack in real-time unless user has manually selected one
  const [userSelected, setUserSelected] = useState(false);
  useEffect(() => {
    if (!userSelected && attacks.length) {
      setSelId(attacks[attacks.length - 1].id);
    }
  }, [attacks, defenses, userSelected]);

  // Reset auto-follow after 30s of inactivity
  useEffect(() => {
    if (!userSelected) return;
    const t = setTimeout(() => setUserSelected(false), 30000);
    return () => clearTimeout(t);
  }, [userSelected]);

  const latest  = attacks.length ? attacks[attacks.length-1] : null;
  const selAtk  = selId ? (attacks.find(a=>a.id===selId)||latest) : latest;
  const selDef  = selAtk ? defenses.find(d=>d.attack_id===selAtk.id) : null;
  const topo    = selAtk ? (TOPOLOGIES[selAtk.type]||TOPOLOGIES["SQL Injection"]) : TOPOLOGIES["SQL Injection"];

  const maxX = Math.max(...topo.nodes.map(n=>n.x)) + NODE_W + 60;
  const maxY = Math.max(...topo.nodes.map(n=>n.y)) + NODE_H + 60;

  if (!latest) return (
    <div className="flex items-center justify-center h-96 bg-slate-900/50 border border-slate-800 rounded-xl">
      <div className="text-center">
        <Activity size={48} className="text-slate-600 mx-auto mb-4 animate-pulse" />
        <p className="text-slate-400 font-mono">Waiting for attack activity...</p>
        <p className="text-slate-600 text-sm mt-2">Backend must be running on port 8001</p>
      </div>
    </div>
  );

  return (
    <div className="flex gap-4 h-[calc(100vh-10rem)]">
      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl relative overflow-auto flex flex-col">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage:"linear-gradient(#334155 1px,transparent 1px),linear-gradient(90deg,#334155 1px,transparent 1px)",backgroundSize:"30px 30px"}} />

        <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white font-bold text-sm">{selAtk?.type}</span>
          <StatusBadge status={selAtk?.status} />
          <span className="text-slate-500 text-xs">→ {selAtk?.target}</span>
          {selAtk?.agent_name?.includes("Manual") && <span className="ml-2 text-[10px] px-2 py-0.5 bg-orange-900/30 text-orange-400 rounded font-mono">MANUAL</span>}
        </div>

        <div className="relative flex-1" style={{width:maxX,height:maxY,minWidth:"100%",minHeight:"400px"}}>
          <svg className="absolute inset-0 pointer-events-none" style={{width:maxX,height:maxY}}>
            <defs>
              <marker id="a0" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#475569"/></marker>
              <marker id="a1" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#10b981"/></marker>
              <marker id="a2" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#ef4444"/></marker>
            </defs>
            {topo.edges.map((edge,i)=>{
              const s=topo.nodes.find(n=>n.id===edge.from), t=topo.nodes.find(n=>n.id===edge.to);
              if(!s||!t) return null;
              const active=edgeActive(edge,selAtk,selDef);
              const isRed=RED_NODES.has(edge.from);
              const x1=s.x+NODE_W, y1=s.y+NODE_H/2, x2=t.x, y2=t.y+NODE_H/2;
              const mx=(x1+x2)/2, my=(y1+y2)/2;
              return (
                <g key={i}>
                  <path d={`M${x1},${y1} C${x1+50},${y1} ${x2-50},${y2} ${x2},${y2}`}
                    fill="none"
                    stroke={active?(isRed?"#ef4444":"#10b981"):"#334155"}
                    strokeWidth={active?2.5:1.5}
                    markerEnd={active?(isRed?"url(#a2)":"url(#a1)"):"url(#a0)"}
                    opacity={active?1:0.3}
                    strokeDasharray={active&&isRed?"6,3":"0"}
                  />
                  {edge.label&&active&&<text x={mx} y={my-6} textAnchor="middle" fill={isRed?"#ef4444":"#10b981"} fontSize="9" fontFamily="monospace">{edge.label}</text>}
                </g>
              );
            })}
          </svg>

          {topo.nodes.map(n=>{
            const Icon=ICON_MAP[n.icon]||Activity;
            const st=nodeStatus(n.id,selAtk,selDef);
            const bc=nodeBorderColor(st, n.color);
            const glow=nodeGlow(st, n.color);
            return (
              <div key={n.id}
                className={`absolute rounded-xl border-2 flex flex-col justify-center px-3 select-none transition-all duration-500 ${
                  st==="active"  ? "bg-slate-800 scale-105" :
                  st==="done"    ? "bg-slate-900/90" :
                  st==="failed"  ? "bg-red-950/40" :
                  "bg-slate-950"
                }`}
                style={{left:n.x,top:n.y,width:NODE_W,height:NODE_H,borderColor:bc,boxShadow:glow}}>
                <div className="flex items-center gap-2 mb-0.5">
                  <Icon size={15} className={
                    st==="active"  ? "text-yellow-400" :
                    st==="done"    ? "text-white" :
                    st==="failed"  ? "text-red-400" :
                    "text-slate-500"
                  } />
                  <span className="text-xs font-bold text-white truncate">{n.label}</span>
                </div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wide">{n.sub}</div>
                {st==="active"  && <div className="text-[9px] text-yellow-400 font-mono animate-pulse mt-0.5">● active</div>}
                {st==="done"    && <div className="text-[9px] text-emerald-400 font-mono mt-0.5">✓ done</div>}
                {st==="failed"  && <div className="text-[9px] text-red-400 font-mono mt-0.5 animate-pulse">✗ failed</div>}
              </div>
            );
          })}
        </div>

        {attacks.length>1&&(
          <div className="sticky bottom-0 bg-slate-950/90 border-t border-slate-800 p-3 flex gap-2 overflow-x-auto">
            <button
              onClick={() => { setUserSelected(false); setSelId(null); }}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                !userSelected ? "border-blue-500 bg-blue-900/30 text-blue-400" : "border-slate-700 bg-slate-900 text-slate-500 hover:border-slate-600"
              }`}>
              ● Live
            </button>
            {attacks.slice(-8).reverse().map(a=>(
              <button key={a.id} onClick={()=>{ setSelId(a.id); setUserSelected(true); }}
                className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                  selId===a.id&&userSelected?"border-blue-500 bg-blue-900/30 text-white":"border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600"
                }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  a.status==="BLOCKED"?"bg-green-500":
                  a.status==="SUCCESS"?"bg-red-500 animate-pulse":
                  a.status==="FAILED"?"bg-red-500":
                  "bg-yellow-500 animate-pulse"
                }`}/>
                <span className="truncate max-w-[100px]">{a.type}</span>
                {a.agent_name?.includes("Manual")&&<span className="text-orange-400 text-[9px]">M</span>}
                {a.agent_name?.includes("Real")&&<span className="text-red-400 text-[9px]">!</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-80 flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-400 tracking-wider">LIVE DETAILS</div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          <div className="bg-red-950/20 border border-red-900/40 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={13} className="text-red-400"/>
              <span className="font-bold text-red-400 text-xs uppercase">Attack</span>
              <StatusBadge status={selAtk?.status}/>
              {selAtk?.agent_name?.includes("Manual")&&<span className="text-[9px] px-1.5 py-0.5 bg-orange-900/30 text-orange-400 rounded font-mono ml-auto">MANUAL</span>}
            </div>
            <div className="text-xs font-bold text-white mb-1">{selAtk?.type}</div>
            <div className="text-xs text-slate-400 mb-2">{selAtk?.agent_name} → {selAtk?.target}</div>
            <div className="text-xs text-slate-300 leading-relaxed mb-2">{selAtk?.strategy}</div>
            <div className="p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[10px] text-slate-500 break-all">{selAtk?.payload}</div>
          </div>

          {selDef?(
            <div className="bg-blue-950/20 border border-blue-900/40 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={13} className="text-blue-400"/>
                <span className="font-bold text-blue-400 text-xs uppercase">Defense</span>
                <StatusBadge status={selDef.status}/>
                <span className="ml-auto text-xs text-blue-400 font-bold">{selDef.confidence}%</span>
              </div>
              <div className="text-xs font-bold text-white mb-1">{selDef.agent_name}</div>
              <div className="text-xs text-slate-300 leading-relaxed mb-2">{selDef.analysis}</div>
              <div className="text-xs text-blue-300 leading-relaxed">{selDef.mitigation}</div>
            </div>
          ):(
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-500 italic animate-pulse">Blue Team analyzing...</div>
            </div>
          )}

          {selAtk?.logs?.length>0&&(
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Timeline</div>
              <div className="space-y-1">
                {selAtk.logs.map((log,i)=><div key={i} className="text-[10px] text-slate-400 font-mono">{log}</div>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
