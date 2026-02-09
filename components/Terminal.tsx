import React, { useEffect, useRef } from 'react';
import { LogEntry, AgentType } from '../types';

interface TerminalProps {
  logs: LogEntry[];
  title?: string;
}

export const Terminal: React.FC<TerminalProps> = ({ logs, title = "SYSTEM LOGS" }) => {
  const endRef = useRef<HTMLDivElement>(null);

  // Removed auto-scroll to prevent jumping when user scrolls up

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden font-mono text-xs shadow-2xl">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
        <span className="text-slate-400 font-bold tracking-wider">{title}</span>
        <div className="flex space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {logs.length === 0 && <div className="text-slate-600 italic">No active logs...</div>}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 break-all opacity-90 hover:opacity-100 transition-opacity">
            <span className="text-slate-500 whitespace-nowrap">[{log.timestamp}]</span>
            <span className={`font-bold whitespace-nowrap ${
              log.type === AgentType.RED ? 'text-red-400' : 
              log.type === AgentType.BLUE ? 'text-blue-400' : 'text-purple-400'
            }`}>
              {log.source}:
            </span>
            <span className={`${
              log.level === 'CRITICAL' ? 'text-red-500 font-bold' :
              log.level === 'WARN' ? 'text-yellow-400' :
              log.level === 'SUCCESS' ? 'text-green-400' :
              'text-slate-300'
            }`}>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};