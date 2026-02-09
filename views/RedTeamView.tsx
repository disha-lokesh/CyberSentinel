import React, { useState } from 'react';
import { Agent, AgentStatus, AgentType, LogEntry } from '../types';
import { AgentCard } from '../components/AgentCard';
import { Terminal } from '../components/Terminal';
import { 
  Skull, Zap, Lock, Mail, FileX, Wifi, ShieldAlert, Database,
  Play, Loader2, AlertTriangle 
} from 'lucide-react';
import { 
  AttackType, 
  AttackResult, 
  executeRedTeamAttack,
  progressAttack 
} from '../services/agentService';
import { ATTACK_DESCRIPTIONS } from '../constants';

interface RedTeamViewProps {
  agents: Agent[];
  onAgentUpdate: (agents: Agent[]) => void;
  onLogGenerated: (log: any) => void;
  onAttackLaunched?: (attack: AttackResult) => void;
  logs: LogEntry[];
}

const ATTACK_ICONS: Record<AttackType, any> = {
  [AttackType.SQL_INJECTION]: Database,
  [AttackType.XSS]: Zap,
  [AttackType.BRUTE_FORCE]: Lock,
  [AttackType.PHISHING]: Mail,
  [AttackType.RANSOMWARE]: FileX,
  [AttackType.DDoS]: Wifi,
  [AttackType.PRIVILEGE_ESCALATION]: ShieldAlert,
  [AttackType.DATA_EXFILTRATION]: Database
};

export const RedTeamView: React.FC<RedTeamViewProps> = ({ 
  agents, 
  onAgentUpdate,
  onLogGenerated,
  onAttackLaunched,
  logs
}) => {
  const [activeAttacks, setActiveAttacks] = useState<AttackResult[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(agents[0] || null);
  const [executingAttack, setExecutingAttack] = useState<string | null>(null);

  const handleAttackLaunch = async (attackType: AttackType) => {
    if (!selectedAgent || executingAttack) return;

    setExecutingAttack(attackType);

    // Update agent status
    const updatedAgents = agents.map(a => 
      a.id === selectedAgent.id 
        ? { ...a, status: AgentStatus.EXECUTING, currentTask: `Executing ${attackType}` }
        : a
    );
    onAgentUpdate(updatedAgents);

    // Generate log
    onLogGenerated({
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      source: selectedAgent.name,
      level: 'WARN',
      message: `Initiating ${attackType} attack`,
      type: AgentType.RED
    });

    try {
      // Execute attack using Gemini
      const result = await executeRedTeamAttack(attackType, selectedAgent);
      
      setActiveAttacks(prev => [...prev, result]);

      // Notify parent component
      if (onAttackLaunched) {
        onAttackLaunched(result);
      }

      // Log attack details
      onLogGenerated({
        id: (Date.now() + 1).toString(),
        timestamp: new Date().toLocaleTimeString(),
        source: selectedAgent.name,
        level: 'CRITICAL',
        message: `${attackType}: ${result.strategy}`,
        type: AgentType.RED
      });

      // Simulate attack progression
      setTimeout(() => {
        setActiveAttacks(prev => 
          prev.map(a => a.id === result.id ? progressAttack(a) : a)
        );
        if (onAttackLaunched) {
          const updated = progressAttack(result);
          onAttackLaunched(updated);
        }
      }, 2000);

      setTimeout(() => {
        setActiveAttacks(prev => 
          prev.map(a => a.id === result.id ? progressAttack(a) : a)
        );
        if (onAttackLaunched) {
          const updated = progressAttack(progressAttack(result));
          onAttackLaunched(updated);
        }
      }, 4000);

      // Reset agent status
      setTimeout(() => {
        const resetAgents = agents.map(a => 
          a.id === selectedAgent.id 
            ? { ...a, status: AgentStatus.IDLE, currentTask: 'Awaiting orders' }
            : a
        );
        onAgentUpdate(resetAgents);
      }, 5000);

    } catch (error) {
      console.error('Attack execution failed:', error);
      onLogGenerated({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        source: selectedAgent.name,
        level: 'CRITICAL',
        message: `Attack failed: ${error}`,
        type: AgentType.RED
      });
    } finally {
      setExecutingAttack(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-red-900/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Skull className="text-red-400" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-red-400">Red Team Operations</h2>
            <p className="text-slate-400 text-sm">Offensive Security - Manual Attack Execution</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-950/30 border border-red-900/50 rounded-lg">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-400 font-mono text-sm">OFFENSIVE MODE</span>
        </div>
      </div>

      {/* Agent Selection */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
          Select Attack Agent
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map(agent => (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`cursor-pointer transition-all ${
                selectedAgent?.id === agent.id
                  ? 'ring-2 ring-red-500 scale-105'
                  : 'hover:ring-1 hover:ring-red-700'
              }`}
            >
              <AgentCard agent={agent} compact />
            </div>
          ))}
        </div>
      </div>

      {/* Attack Control Panel */}
      <div className="bg-slate-900/50 border border-red-900/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-red-400">Attack Vectors</h3>
          {selectedAgent && (
            <div className="text-sm text-slate-400">
              Selected: <span className="text-red-400 font-bold">{selectedAgent.name}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.values(AttackType).map((attackType) => {
            const Icon = ATTACK_ICONS[attackType];
            const isExecuting = executingAttack === attackType;
            const isDisabled = !selectedAgent || executingAttack !== null;

            return (
              <button
                key={attackType}
                onClick={() => handleAttackLaunch(attackType)}
                disabled={isDisabled}
                className={`group relative p-4 rounded-lg border-2 transition-all ${
                  isExecuting
                    ? 'bg-red-600 border-red-500 animate-pulse'
                    : isDisabled
                    ? 'bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed'
                    : 'bg-slate-900 border-red-900/50 hover:border-red-500 hover:bg-red-950/30 hover:scale-105'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  {isExecuting ? (
                    <Loader2 className="text-white animate-spin" size={32} />
                  ) : (
                    <Icon className="text-red-400 group-hover:text-red-300" size={32} />
                  )}
                  <div className="text-center">
                    <div className="font-bold text-sm text-white mb-1">{attackType}</div>
                    <div className="text-xs text-slate-400 line-clamp-2">
                      {ATTACK_DESCRIPTIONS[attackType]}
                    </div>
                  </div>
                  {!isDisabled && !isExecuting && (
                    <div className="flex items-center gap-1 text-xs text-red-400 font-mono">
                      <Play size={12} /> LAUNCH
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Attacks */}
      {activeAttacks.length > 0 && (
        <div className="bg-slate-900/50 border border-red-900/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} />
            Active Attacks ({activeAttacks.length})
          </h3>
          <div className="space-y-3">
            {activeAttacks.slice(-5).reverse().map((attack) => (
              <div
                key={attack.id}
                className="bg-slate-950 border border-red-900/50 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                      attack.status === 'INITIATED' ? 'bg-yellow-900/30 text-yellow-400' :
                      attack.status === 'IN_PROGRESS' ? 'bg-orange-900/30 text-orange-400' :
                      attack.status === 'DETECTED' ? 'bg-red-900/30 text-red-400' :
                      attack.status === 'BLOCKED' ? 'bg-blue-900/30 text-blue-400' :
                      'bg-green-900/30 text-green-400'
                    }`}>
                      {attack.status}
                    </div>
                    <span className="font-bold text-white">{attack.type}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(attack.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm text-slate-300 mb-2">{attack.strategy}</div>
                <div className="text-xs text-slate-500 font-mono bg-slate-900 p-2 rounded">
                  {attack.payload}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terminal Logs */}
      <div className="h-96">
        <Terminal 
          logs={logs.filter(l => l.type === AgentType.RED)} 
          title="RED TEAM OPERATIONS LOG" 
        />
      </div>
    </div>
  );
};
