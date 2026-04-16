import React, { useState } from 'react';
import { AgentModel, AgentStatus, AgentType } from '../models/AgentModel';
import { LogEntry } from '../models/ThreatModel';
import { AgentCard } from '../components/AgentCard';
import { Terminal } from '../components/Terminal';
import { 
  Skull, Zap, Lock, Mail, FileX, Wifi, ShieldAlert, Database,
  Play, Loader2, AlertTriangle 
} from 'lucide-react';
import { 
  AttackType, AttackModel, AttackStatus,
  executeRedTeamAttack, progressAttack 
} from '../services/agentService';
import { ATTACK_DESCRIPTIONS } from '../constants';
import { getAgentSnapshots } from '../agents/AgentRegistry';

interface RedTeamViewProps {
  agents: AgentModel[];
  onAgentUpdate: (agents: AgentModel[]) => void;
  onLogGenerated: (log: LogEntry) => void;
  onAttackLaunched?: (attack: AttackModel) => void;
  logs: LogEntry[];
}

const ATTACK_ICONS: Record<AttackType, any> = {
  [AttackType.SQL_INJECTION]:        Database,
  [AttackType.XSS]:                  Zap,
  [AttackType.BRUTE_FORCE]:          Lock,
  [AttackType.PHISHING]:             Mail,
  [AttackType.RANSOMWARE]:           FileX,
  [AttackType.DDOS]:                 Wifi,
  [AttackType.PRIVILEGE_ESCALATION]: ShieldAlert,
  [AttackType.DATA_EXFILTRATION]:    Database
};

export const RedTeamView: React.FC<RedTeamViewProps> = ({ 
  agents, onAgentUpdate, onLogGenerated, onAttackLaunched, logs
}) => {
  const [activeAttacks, setActiveAttacks] = useState<AttackModel[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || '');
  const [executingAttack, setExecutingAttack] = useState<string | null>(null);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  const handleAttackLaunch = async (attackType: AttackType) => {
    if (!selectedAgent || executingAttack) return;
    setExecutingAttack(attackType);

    // Update agent status in registry snapshot
    onAgentUpdate(agents.map(a =>
      a.id === selectedAgent.id
        ? { ...a, status: AgentStatus.EXECUTING, currentTask: `Executing ${attackType}` }
        : a
    ));

    onLogGenerated({
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      source: selectedAgent.name,
      level: 'WARN',
      message: `Initiating ${attackType} attack`,
      agentType: 'RED'
    });

    try {
      const result = await executeRedTeamAttack(attackType);
      setActiveAttacks(prev => [...prev, result]);
      if (onAttackLaunched) onAttackLaunched(result);

      onLogGenerated({
        id: (Date.now() + 1).toString(),
        timestamp: new Date().toLocaleTimeString(),
        source: selectedAgent.name,
        level: 'CRITICAL',
        message: `${attackType}: ${result.strategy}`,
        agentType: 'RED'
      });

      // Progress attack status
      setTimeout(() => {
        const p1 = progressAttack(result);
        setActiveAttacks(prev => prev.map(a => a.id === result.id ? p1 : a));
        if (onAttackLaunched) onAttackLaunched(p1);
      }, 2000);

      setTimeout(() => {
        const p2 = progressAttack(progressAttack(result));
        setActiveAttacks(prev => prev.map(a => a.id === result.id ? p2 : a));
        if (onAttackLaunched) onAttackLaunched(p2);
      }, 4000);

      setTimeout(() => {
        onAgentUpdate(getAgentSnapshots(AgentType.RED));
      }, 5000);

    } catch (error: any) {
      onLogGenerated({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        source: selectedAgent.name,
        level: 'CRITICAL',
        message: `Attack failed: ${error.message}`,
        agentType: 'RED'
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
              onClick={() => setSelectedAgentId(agent.id)}
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
              <div key={attack.id} className="bg-slate-950 border border-red-900/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                      attack.status === AttackStatus.INITIATED   ? 'bg-yellow-900/30 text-yellow-400' :
                      attack.status === AttackStatus.IN_PROGRESS ? 'bg-orange-900/30 text-orange-400' :
                      attack.status === AttackStatus.DETECTED    ? 'bg-red-900/30 text-red-400' :
                      attack.status === AttackStatus.BLOCKED     ? 'bg-blue-900/30 text-blue-400' :
                      'bg-green-900/30 text-green-400'
                    }`}>{attack.status}</div>
                    <span className="font-bold text-white">{attack.type}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(attack.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm text-slate-300 mb-2">{attack.strategy}</div>
                <div className="text-xs text-slate-500 font-mono bg-slate-900 p-2 rounded">{attack.payload}</div>
                {attack.ragSourcesUsed?.length > 0 && (
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {attack.ragSourcesUsed.map(s => (
                      <span key={s} className="text-[10px] px-1.5 py-0.5 bg-purple-900/30 text-purple-400 rounded font-mono">{s}</span>
                    ))}
                  </div>
                )}
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
