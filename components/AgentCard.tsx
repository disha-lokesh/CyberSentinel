import React from 'react';
import { Agent, AgentType, AgentStatus } from '../types';
import { Activity, Shield, Crosshair, Cpu } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  compact?: boolean;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, compact = false }) => {
  const isRed = agent.type === AgentType.RED;
  
  const getStatusColor = (status: AgentStatus) => {
    switch(status) {
      case AgentStatus.EXECUTING: return isRed ? 'text-red-400' : 'text-blue-400';
      case AgentStatus.PLANNING: return 'text-purple-400';
      case AgentStatus.IDLE: return 'text-slate-500';
      case AgentStatus.ANALYZING: return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  if (compact) {
    return (
      <div className={`
        relative p-3 rounded-lg border backdrop-blur-sm transition-all duration-300
        ${isRed 
          ? 'bg-red-950/10 border-red-900/30 hover:border-red-500/50' 
          : 'bg-blue-950/10 border-blue-900/30 hover:border-blue-500/50'}
      `}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded-md ${isRed ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
            {isRed ? <Crosshair size={16} /> : <Shield size={16} />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-100 truncate">{agent.name}</h3>
            <p className="text-xs text-slate-500 truncate">{agent.role}</p>
          </div>
        </div>
        <div className={`text-xs font-mono px-2 py-0.5 rounded-full border ${getStatusColor(agent.status)} border-current bg-opacity-10 text-center`}>
          {agent.status}
        </div>
      </div>
    );
  }

  return (
    <div className={`
      relative p-4 rounded-lg border backdrop-blur-sm transition-all duration-300
      ${isRed 
        ? 'bg-red-950/10 border-red-900/30 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
        : 'bg-blue-950/10 border-blue-900/30 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]'}
    `}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-md ${isRed ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
            {isRed ? <Crosshair size={18} /> : <Shield size={18} />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">{agent.name}</h3>
            <p className="text-xs text-slate-500">{agent.role}</p>
          </div>
        </div>
        <div className={`text-xs font-mono px-2 py-0.5 rounded-full border ${getStatusColor(agent.status)} border-current bg-opacity-10`}>
          {agent.status}
        </div>
      </div>

      {/* Task */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Current Task</p>
        <p className="text-sm text-slate-200 font-mono truncate">{agent.currentTask}</p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs border-t border-slate-800 pt-3">
        <div className="flex items-center gap-1 text-slate-400">
          <Cpu size={14} />
          <span>Efficiency</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
             <div 
               className={`h-full rounded-full ${isRed ? 'bg-red-500' : 'bg-blue-500'}`} 
               style={{ width: `${agent.efficiency}%` }}
             ></div>
           </div>
           <span className="font-mono text-slate-300">{agent.efficiency}%</span>
        </div>
      </div>
      
      {/* Latest Log */}
      {agent.logs.length > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-800/50">
          <p className="text-[10px] text-slate-500 font-mono truncate">
            &gt; {agent.logs[agent.logs.length - 1]}
          </p>
        </div>
      )}
    </div>
  );
};