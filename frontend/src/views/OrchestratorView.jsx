import { useState, useEffect } from "react";
import { BrainCircuit, Sparkles, RefreshCw, Database } from "lucide-react";
import { api } from "../api/client";

export default function OrchestratorView({ attacks, defenses, redAgents, blueAgents }) {
  const [decision,   setDecision]   = useState(null);
  const [thinking,   setThinking]   = useState(false);
  const [history,    setHistory]    = useState([]);
  const [autoRefresh,setAutoRefresh]= useState(true);

  const analyze = async () => {
    setThinking(true);
    try {
      const result = await api.orchestratorAnalyze();
      setDecision(result);
      setHistory(prev => [result, ...prev].slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setThinking(false);
    }
  };

  // Auto-analyze every 30s
  useEffect(() => {
    analyze();
    if (!autoRefresh) return;
    const t = setInterval(analyze, 30000);
    return () => clearInterval(t);
  }, [autoRefresh]);

  return (
    <div className="grid grid-cols-12 gap-6">

      {/* Main reasoning panel */}
      <div className="col-span-8 space-y-6">
        <div className="bg-slate-900/50 border border-purple-500/30 rounded-xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500" />
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <BrainCircuit size={32} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Gemini 3.1 Pro
                <span className="text-xs font-mono font-normal text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  ORCHESTRATOR
                </span>
              </h2>
              <p className="text-slate-400 text-sm">Strategic Reasoning & Agent Coordination</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setAutoRefresh(v => !v)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  autoRefresh
                    ? "border-purple-500/50 text-purple-400 bg-purple-900/20"
                    : "border-slate-700 text-slate-500"
                }`}
              >
                Auto {autoRefresh ? "ON" : "OFF"}
              </button>
              <button
                onClick={analyze}
                disabled={thinking}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50"
              >
                <RefreshCw size={14} className={thinking ? "animate-spin" : ""} />
                Analyze
              </button>
            </div>
          </div>

          {/* Threat Assessment */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-yellow-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Threat Assessment</span>
              {thinking && <span className="text-xs text-purple-400 animate-pulse font-mono ml-auto">Gemini 3.1 Pro thinking...</span>}
            </div>

            <div className="bg-slate-950/80 rounded-xl p-6 border border-slate-800 font-mono text-sm leading-relaxed min-h-[120px] text-slate-300 whitespace-pre-wrap">
              {thinking ? (
                <div className="space-y-2">
                  {[3, 2, 4, 2].map((w, i) => (
                    <div key={i} className={`h-2 bg-slate-800 rounded animate-pulse`} style={{ width: `${w * 20}%` }} />
                  ))}
                </div>
              ) : decision?.threat_assessment || "Click Analyze to get strategic assessment..."}
            </div>
          </div>

          {/* Recommendations */}
          {decision?.recommendations?.length > 0 && (
            <div className="relative z-10 mt-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recommendations</p>
              <div className="space-y-2">
                {decision.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-purple-400 font-bold text-sm shrink-0">{i + 1}.</span>
                    <span className="text-slate-300 text-sm">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vulnerabilities */}
          {decision?.vulnerabilities?.length > 0 && (
            <div className="relative z-10 mt-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Vulnerabilities Identified</p>
              <div className="flex flex-wrap gap-2">
                {decision.vulnerabilities.map((v, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 bg-red-950/30 border border-red-900/50 text-red-400 rounded-full">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* RAG sources */}
          {decision?.rag_sources_used?.length > 0 && (
            <div className="relative z-10 mt-4 flex items-center gap-2">
              <Database size={12} className="text-purple-400" />
              <span className="text-xs text-slate-500">RAG sources:</span>
              {decision.rag_sources_used.map(s => (
                <span key={s} className="text-[10px] px-1.5 py-0.5 bg-purple-900/30 text-purple-400 rounded font-mono">{s}</span>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 1 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Decision History</h3>
            <div className="space-y-3">
              {history.slice(1).map((h, i) => (
                <div key={i} className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <p className="text-xs text-slate-500 font-mono line-clamp-2">{h.threat_assessment}</p>
                  <p className="text-[10px] text-slate-600 mt-1">{new Date(h.timestamp * 1000).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right column */}
      <div className="col-span-4 space-y-4">
        {/* Stats */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">System State</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Attacks",   value: attacks.length,  color: "text-red-400" },
              { label: "Defenses",  value: defenses.length, color: "text-blue-400" },
              { label: "Blocked",   value: defenses.filter(d => d.status === "BLOCKED").length, color: "text-green-400" },
              { label: "Failed",    value: defenses.filter(d => d.status === "FAILED").length,  color: "text-red-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-3 bg-slate-950 rounded-lg text-center">
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Directives */}
        {decision?.agent_directives && Object.keys(decision.agent_directives).length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Agent Directives</h3>
            <div className="space-y-2">
              {Object.entries(decision.agent_directives).map(([agent, directive]) => (
                <div key={agent} className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-xs font-bold text-blue-400 mb-1">{agent}</div>
                  <div className="text-xs text-slate-400">{directive}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Model info */}
        <div className="bg-slate-900/50 border border-purple-900/30 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Models</h3>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Agents</span>
              <span className="text-green-400">gemini-3-flash</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Orchestrator</span>
              <span className="text-purple-400">gemini-3.1-pro</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">RAG</span>
              <span className="text-blue-400">ChromaDB + MiniLM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
