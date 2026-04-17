import { useState } from "react";
import {
  LayoutDashboard, Shield, BrainCircuit, Activity,
  Network, Bell, LogOut, ChevronRight, FileText
} from "lucide-react";

const NAV = [
  { section: "Operations" },
  { id: "dashboard",    icon: LayoutDashboard, label: "SOC Dashboard" },
  { id: "workflow",     icon: Network,         label: "Agent Workflow" },
  { id: "blue-team",    icon: Shield,          label: "Blue Team" },
  { section: "Intelligence" },
  { id: "orchestrator", icon: BrainCircuit,    label: "Gemini Orchestrator" },
  { id: "reporting",    icon: Activity,        label: "Reports" },
];

export default function Layout({ children, activeView, onNavigate, analyst, onLogout }) {
  const [alerts] = useState(3);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex font-sans overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-[#020617] border-r border-slate-800 flex flex-col fixed h-full z-20">

        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-purple-500/20">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">CyberSentinel</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Gemini 3 Platform</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((item, i) => {
            if (item.section) return (
              <p key={i} className="px-6 pt-5 pb-1 text-xs font-bold text-slate-600 uppercase tracking-wider">
                {item.section}
              </p>
            );
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-r-lg border-l-2 transition-all group ${
                  active
                    ? "bg-slate-800/60 border-emerald-400 text-white"
                    : "border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Icon size={18} className={active ? "text-emerald-400" : "group-hover:text-slate-200"} />
                <span className="text-sm font-medium">{item.label}</span>
                {active && <ChevronRight size={14} className="ml-auto text-emerald-400" />}
              </button>
            );
          })}
        </nav>

        {/* Red Team status indicator (no view — runs autonomously) */}
        <div className="mx-4 mb-3 p-3 bg-red-950/20 border border-red-900/30 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Red Team Active</span>
          </div>
          <p className="text-[10px] text-slate-500">4 agents running autonomously</p>
          <p className="text-[10px] text-slate-600 mt-0.5">No analyst access required</p>
        </div>

        {/* Analyst info */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {analyst?.name?.[0] || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{analyst?.name || "Analyst"}</p>
              <p className="text-[10px] text-slate-500 truncate">{analyst?.role || "SOC Analyst"}</p>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 bg-blue-900/40 text-blue-400 border border-blue-900/50 rounded font-mono">
              {analyst?.clearance || "SECRET"}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-all text-xs"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-[#020617]/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              SYSTEM ONLINE
            </span>
            <span className="text-slate-500 text-xs border-l border-slate-700 pl-4 font-mono">
              {new Date().toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={18} />
              {alerts > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {alerts}
                </span>
              )}
            </button>
            <div className="text-xs text-slate-500 font-mono border-l border-slate-700 pl-3">
              Gemini 3 Flash · 3.1 Pro
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-black/20">
          {children}
        </div>
      </main>
    </div>
  );
}
