import React, { useState } from 'react';
import { LayoutDashboard, Shield, Sword, BrainCircuit, Activity, Settings, User, Bell, Network } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => onNavigate(id)}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-r-lg border-l-2 transition-all duration-200 group
        ${activeView === id 
          ? 'bg-slate-800/50 border-cyber-accent text-slate-100' 
          : 'border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'}
      `}
    >
      <Icon size={20} className={activeView === id ? 'text-cyber-accent' : 'group-hover:text-slate-200'} />
      <span className="font-medium tracking-wide text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-cyber-900 text-slate-200 flex font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`w-64 bg-cyber-900 border-r border-slate-800 flex flex-col fixed h-full z-20`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center mr-3 shadow-lg shadow-purple-500/20">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">CyberSentinel</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Agentic Platform</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-1">
          <div className="px-6 mb-2 text-xs font-bold text-slate-600 uppercase tracking-wider">Operations</div>
          <NavItem id="dashboard" icon={LayoutDashboard} label="SOC Dashboard" />
          <NavItem id="workflow" icon={Network} label="Agent Workflow" />
          <NavItem id="blue-team" icon={Shield} label="Blue Team" />
          <NavItem id="red-team" icon={Sword} label="Red Team" />
          
          <div className="px-6 mt-8 mb-2 text-xs font-bold text-slate-600 uppercase tracking-wider">Intelligence</div>
          <NavItem id="orchestrator" icon={BrainCircuit} label="Gemini Core" />
          <NavItem id="reporting" icon={Activity} label="Reporting" />
        </nav>

        {/* User / Settings */}
        <div className="p-4 border-t border-slate-800 space-y-2">
           <button className="flex items-center gap-3 px-2 py-2 w-full text-slate-400 hover:text-slate-200 transition-colors">
              <Settings size={18} />
              <span className="text-xs">Configuration</span>
           </button>
           <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                <User size={16} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-200">Admin User</p>
                <p className="text-[10px] text-slate-500">SecOps Lead</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-cyber-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
             <span className="flex items-center gap-2 px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-mono font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                SYSTEM ONLINE
             </span>
             <span className="text-slate-500 text-sm border-l border-slate-700 pl-4 font-mono">
                {new Date().toLocaleDateString()}
             </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-cyber-900"></span>
            </button>
          </div>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-black/20">
          {children}
        </div>
      </main>
    </div>
  );
};