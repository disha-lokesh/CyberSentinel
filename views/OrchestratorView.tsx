import React, { useEffect, useState } from 'react';
import { generateStrategicDecision } from '../services/geminiService';
import { BrainCircuit, Sparkles, Database, Network } from 'lucide-react';
import { Agent } from '../types';

interface OrchestratorViewProps {
  redAgents: Agent[];
  blueAgents: Agent[];
}

export const OrchestratorView: React.FC<OrchestratorViewProps> = ({ redAgents, blueAgents }) => {
  const [thought, setThought] = useState<string>('');
  const [isThinking, setIsThinking] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const handleReasoning = async () => {
    setIsThinking(true);
    // Create context from current agents
    const context = `Red Agents: ${redAgents.map(a => a.currentTask).join(', ')}. Blue Agents: ${blueAgents.map(a => a.currentTask).join(', ')}.`;
    
    const decision = await generateStrategicDecision(context);
    setThought(decision);
    setHistory(prev => [decision, ...prev].slice(0, 5));
    setIsThinking(false);
  };

  useEffect(() => {
    // Simulate periodic reasoning
    const interval = setInterval(() => {
        handleReasoning();
    }, 10000); // Reason every 10 seconds
    
    handleReasoning(); // Initial
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Main Reasoning Center */}
      <div className="col-span-8 flex flex-col gap-6">
        <div className="bg-slate-900/50 border border-purple-500/30 rounded-xl p-8 relative overflow-hidden group">
            {/* Background Gradient/Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"></div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all duration-1000"></div>

            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <BrainCircuit size={32} className="text-purple-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        Gemini 3 Pro <span className="text-xs font-mono font-normal text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">ORCHESTRATOR</span>
                    </h2>
                    <p className="text-slate-400">Strategic Reasoning & Agent Coordination</p>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles size={14} className="text-yellow-400" />
                        Current Thought Process
                    </h3>
                    {isThinking && <span className="text-xs text-purple-400 animate-pulse font-mono">GENERATING REASONING...</span>}
                </div>
                
                <div className="bg-slate-950/80 rounded-lg p-6 border border-slate-800 font-mono text-sm leading-relaxed shadow-inner min-h-[200px] text-slate-300 whitespace-pre-wrap">
                    {isThinking ? (
                        <div className="flex flex-col gap-2">
                           <div className="h-2 w-3/4 bg-slate-800 rounded animate-pulse"></div>
                           <div className="h-2 w-1/2 bg-slate-800 rounded animate-pulse"></div>
                           <div className="h-2 w-5/6 bg-slate-800 rounded animate-pulse"></div>
                        </div>
                    ) : (
                        thought || "Initializing neural context..."
                    )}
                </div>
            </div>
        </div>

        {/* History */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Decision History</h3>
            <div className="space-y-4">
                {history.slice(1).map((h, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-lg bg-slate-950 border border-slate-800/50 hover:border-slate-700 transition-colors">
                        <div className="w-1 h-full bg-slate-800 rounded-full"></div>
                        <div className="text-xs text-slate-500 font-mono line-clamp-2">{h}</div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Right Column Stats */}
      <div className="col-span-4 flex flex-col gap-6">
         {/* System State */}
         <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Network size={16} /> Neural Network State
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-lg text-center">
                    <div className="text-2xl font-bold text-white mb-1">128k</div>
                    <div className="text-xs text-slate-500">Context Window</div>
                </div>
                <div className="p-4 bg-slate-950 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-400 mb-1">98.2%</div>
                    <div className="text-xs text-slate-500">Alignment Score</div>
                </div>
                <div className="p-4 bg-slate-950 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-1">45ms</div>
                    <div className="text-xs text-slate-500">Inference Latency</div>
                </div>
                <div className="p-4 bg-slate-950 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-400 mb-1">12</div>
                    <div className="text-xs text-slate-500">Active Models</div>
                </div>
            </div>
         </div>

         {/* Knowledge Base */}
         <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex-1">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Database size={16} /> Knowledge Retrieval
            </h3>
            <ul className="space-y-3 text-xs font-mono text-slate-400">
                <li className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800/50">
                    <span>MITRE ATT&CK Framework</span>
                    <span className="text-green-500">CONNECTED</span>
                </li>
                <li className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800/50">
                    <span>CVE Database (NIST)</span>
                    <span className="text-green-500">CONNECTED</span>
                </li>
                <li className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800/50">
                    <span>Internal Architecture Maps</span>
                    <span className="text-green-500">CONNECTED</span>
                </li>
                <li className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800/50">
                    <span>Threat Intelligence Feed</span>
                    <span className="text-yellow-500">SYNCING...</span>
                </li>
            </ul>
         </div>
      </div>
    </div>
  );
};