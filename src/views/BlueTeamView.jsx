export default function BlueTeamView({ agents, defenses, logs }) {
  const blueLogs = logs.filter(l => l.agentType === "BLUE");
  const blocked  = defenses.filter(d => d.status === "BLOCKED").length;
  const failed   = defenses.filter(d => d.status === "FAILED").length;
  const active   = defenses.filter(d => ["ANALYZING","MITIGATING"].includes(d.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-blue-900/30 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-400">Blue Team Operations</h2>
          <p className="text-slate-400 text-sm">Gemini 3 Flash — Automated Threat Response</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-950/30 border border-blue-900/50 rounded-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-blue-400 font-mono text-sm">AUTO-DEFENSE ACTIVE</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Threats", value: defenses.length, color: "text-white" },
          { label: "Blocked",       value: blocked,          color: "text-green-400" },
          { label: "Analyzing",     value: active,           color: "text-blue-400" },
          { label: "Failed",        value: failed,           color: "text-red-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="text-slate-400 text-sm mb-1">{label}</div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Agents */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {agents.map(a => {
          const agentDefs = defenses.filter(d => d.agent_name === a.name);
          const blocked   = agentDefs.filter(d => d.status === "BLOCKED").length;
          const total     = agentDefs.length;
          const rate      = total > 0 ? Math.round(blocked / total * 100) : a.efficiency;
          const barColor  = rate >= 80 ? "bg-blue-500" : rate >= 50 ? "bg-yellow-500" : "bg-red-500";
          return (
            <div key={a.id} className="bg-slate-900/50 border border-blue-900/30 rounded-xl p-4">
              <div className="font-bold text-white">{a.name}</div>
              <div className="text-xs text-slate-400 mb-2">{a.role}</div>
              <div className={`text-xs font-mono px-2 py-1 rounded text-center ${
                a.status === "ANALYZING"  ? "bg-yellow-900/30 text-yellow-400" :
                a.status === "MITIGATING" ? "bg-blue-900/30 text-blue-400" :
                "bg-slate-800 text-slate-500"
              }`}>{a.status}</div>
              <div className="text-xs text-slate-500 mt-2 truncate">{a.current_task}</div>
              {/* Real success rate bar */}
              <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                  style={{ width: `${rate}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-600 mt-1">
                {total > 0 ? `${blocked}/${total} blocked (${rate}%)` : `Efficiency: ${a.efficiency}%`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Defense Operations */}
      {defenses.length > 0 && (
        <div className="bg-slate-900/50 border border-blue-900/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-400 mb-4">Defense Operations</h3>
          <div className="space-y-3">
            {defenses.slice(-5).reverse().map(d => (
              <div key={d.id} className="bg-slate-950 border border-blue-900/40 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded font-bold ${
                      d.status === "BLOCKED"    ? "bg-green-900/30 text-green-400" :
                      d.status === "FAILED"     ? "bg-red-900/30 text-red-400" :
                      d.status === "MITIGATING" ? "bg-blue-900/30 text-blue-400" :
                      "bg-yellow-900/30 text-yellow-400"
                    }`}>{d.status}</span>
                    <span className="font-bold text-white">{d.agent_name}</span>
                  </div>
                  <span className="text-xs text-blue-400 font-bold">Confidence: {d.confidence}%</span>
                </div>
                <p className="text-sm text-slate-300 mb-1">{d.analysis}</p>
                <p className="text-sm text-blue-300">{d.mitigation}</p>
                {d.rag_sources_used?.length > 0 && (
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {d.rag_sources_used.map(s => (
                      <span key={s} className="text-[10px] px-1.5 py-0.5 bg-purple-900/30 text-purple-400 rounded font-mono">{s}</span>
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
        <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">BLUE TEAM LOGS</div>
        <div className="p-3 space-y-1 overflow-y-auto h-full">
          {blueLogs.length === 0 && <span className="text-slate-600 italic">No logs yet...</span>}
          {blueLogs.map(l => (
            <div key={l.id} className="flex gap-2">
              <span className="text-slate-500">[{l.timestamp}]</span>
              <span className="text-blue-400 font-bold">{l.source}:</span>
              <span className={l.level === "SUCCESS" ? "text-green-400" : l.level === "CRITICAL" ? "text-red-400" : "text-slate-300"}>{l.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
