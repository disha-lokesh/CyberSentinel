import { useState } from "react";
import { api } from "../api/client";

const ATTACKS = [
  { type: "SQL Injection",        icon: "🗄️", desc: "Database injection attack" },
  { type: "Cross-Site Scripting", icon: "⚡", desc: "Client-side script injection" },
  { type: "Brute Force",          icon: "🔒", desc: "Password cracking attack" },
  { type: "Phishing Campaign",    icon: "📧", desc: "Social engineering attack" },
  { type: "Ransomware Simulation",icon: "📁", desc: "File encryption simulation" },
  { type: "DDoS Attack",          icon: "📡", desc: "Service disruption attack" },
  { type: "Privilege Escalation", icon: "🔓", desc: "Access elevation exploit" },
  { type: "Data Exfiltration",    icon: "📤", desc: "Covert data theft" },
];

export default function RedTeamView({ agents, logs }) {
  const [selected, setSelected]   = useState(agents[0]?.id || "");
  const [launching, setLaunching] = useState(null);
  const [results, setResults]     = useState([]);

  const launch = async (attackType) => {
    if (launching) return;
    setLaunching(attackType);
    try {
      const result = await api.launchAttack(attackType);
      setResults(prev => [result, ...prev].slice(0, 10));
    } catch (e) {
      console.error(e);
    } finally {
      setLaunching(null);
    }
  };

  const redLogs = logs.filter(l => l.agentType === "RED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-red-900/30 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-red-400">Red Team Operations</h2>
          <p className="text-slate-400 text-sm">Gemini 3 Flash — Manual Attack Execution</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-950/30 border border-red-900/50 rounded-lg">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-red-400 font-mono text-sm">OFFENSIVE MODE</span>
        </div>
      </div>

      {/* Agent Selection */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Select Agent</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {agents.map(a => (
            <div
              key={a.id}
              onClick={() => setSelected(a.id)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selected === a.id
                  ? "border-red-500 bg-red-950/30 scale-105"
                  : "border-red-900/30 bg-slate-900/50 hover:border-red-700"
              }`}
            >
              <div className="font-bold text-white text-sm">{a.name}</div>
              <div className="text-xs text-slate-400">{a.role}</div>
              <div className={`text-xs mt-1 font-mono ${
                a.status === "EXECUTING" ? "text-red-400" :
                a.status === "IDLE"      ? "text-slate-500" : "text-yellow-400"
              }`}>{a.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Attack Buttons */}
      <div className="bg-slate-900/50 border border-red-900/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-red-400 mb-4">Attack Vectors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ATTACKS.map(({ type, icon, desc }) => (
            <button
              key={type}
              onClick={() => launch(type)}
              disabled={!!launching}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                launching === type
                  ? "border-yellow-400 bg-yellow-900/20 animate-pulse"
                  : launching
                  ? "border-slate-800 opacity-50 cursor-not-allowed"
                  : "border-red-900/50 bg-slate-900 hover:border-red-500 hover:bg-red-950/20 hover:scale-105"
              }`}
            >
              <div className="text-3xl mb-2">{icon}</div>
              <div className="font-bold text-white text-sm">{type}</div>
              <div className="text-xs text-slate-400 mt-1">{desc}</div>
              {launching === type && (
                <div className="text-xs text-yellow-400 mt-2 font-mono animate-pulse">
                  Gemini 3 generating...
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Attacks */}
      {results.length > 0 && (
        <div className="bg-slate-900/50 border border-red-900/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-red-400 mb-4">Recent Attacks</h3>
          <div className="space-y-3">
            {results.map(r => (
              <div key={r.id} className="bg-slate-950 border border-red-900/40 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">{r.type}</span>
                  <span className={`text-xs px-2 py-1 rounded font-bold ${
                    r.status === "BLOCKED"     ? "bg-blue-900/30 text-blue-400" :
                    r.status === "DETECTED"    ? "bg-red-900/30 text-red-400" :
                    r.status === "IN_PROGRESS" ? "bg-orange-900/30 text-orange-400" :
                    "bg-yellow-900/30 text-yellow-400"
                  }`}>{r.status}</span>
                </div>
                <p className="text-sm text-slate-300 mb-2">{r.strategy}</p>
                <code className="text-xs text-slate-500 bg-slate-900 p-2 rounded block">{r.payload}</code>
                {r.rag_sources_used?.length > 0 && (
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {r.rag_sources_used.map(s => (
                      <span key={s} className="text-[10px] px-1.5 py-0.5 bg-purple-900/30 text-purple-400 rounded font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terminal */}
      <div className="h-64 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden font-mono text-xs">
        <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
          RED TEAM LOGS
        </div>
        <div className="p-3 space-y-1 overflow-y-auto h-full">
          {redLogs.length === 0 && <span className="text-slate-600 italic">No logs yet...</span>}
          {redLogs.map(l => (
            <div key={l.id} className="flex gap-2">
              <span className="text-slate-500">[{l.timestamp}]</span>
              <span className="text-red-400 font-bold">{l.source}:</span>
              <span className={l.level === "CRITICAL" ? "text-red-500 font-bold" : "text-slate-300"}>{l.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
