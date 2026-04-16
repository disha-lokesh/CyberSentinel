import React, { useEffect, useState } from 'react';
import { AgentModel, AgentStatus, AgentType } from '../models/AgentModel';
import { LogEntry } from '../models/ThreatModel';
import { AgentCard } from '../components/AgentCard';
import { Terminal } from '../components/Terminal';
import { Shield, Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { 
  AttackModel, DefenseModel, DefenseStatus,
  executeBlueTeamDefense, progressDefense
} from '../services/agentService';
import { getAgentSnapshots } from '../agents/AgentRegistry';

interface BlueTeamViewProps {
  agents: AgentModel[];
  onAgentUpdate: (agents: AgentModel[]) => void;
  onLogGenerated: (log: LogEntry) => void;
  incomingAttacks: AttackModel[];
  logs: LogEntry[];
}

export const BlueTeamView: React.FC<BlueTeamViewProps> = ({ 
  agents, onAgentUpdate, onLogGenerated, incomingAttacks, logs
}) => {
  const [defenses, setDefenses] = useState<DefenseModel[]>([]);
  const [stats, setStats] = useState({ totalAttacks: 0, blocked: 0, analyzing: 0, failed: 0 });
  const [handledIds] = useState(new Set<string>());

  useEffect(() => {
    const latestAttack = incomingAttacks[incomingAttacks.length - 1];
    if (!latestAttack || latestAttack.status !== 'DETECTED') return;
    if (handledIds.has(latestAttack.id)) return;
    handledIds.add(latestAttack.id);

    const handleIncomingAttack = async (attack: AttackModel) => {
      const availableAgent = agents.find(a => a.status === AgentStatus.IDLE) || agents[0];

      onAgentUpdate(agents.map(a =>
        a.id === availableAgent.id
          ? { ...a, status: AgentStatus.ANALYZING, currentTask: `Analyzing ${attack.type}` }
          : a
      ));

      onLogGenerated({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        source: availableAgent.name,
        level: 'WARN',
        message: `Threat detected: ${attack.type}`,
        agentType: 'BLUE'
      });

      try {
        const defense = await executeBlueTeamDefense(attack);
        setDefenses(prev => [...prev, defense]);

        onLogGenerated({
          id: (Date.now() + 1).toString(),
          timestamp: new Date().toLocaleTimeString(),
          source: availableAgent.name,
          level: 'INFO',
          message: `Analysis: ${defense.analysis}`,
          agentType: 'BLUE'
        });

        setTimeout(() => {
          setDefenses(prev => prev.map(d => d.id === defense.id ? progressDefense(d, true) : d));
          onAgentUpdate(agents.map(a =>
            a.id === availableAgent.id
              ? { ...a, status: AgentStatus.MITIGATING, currentTask: `Mitigating ${attack.type}` }
              : a
          ));
        }, 2000);

        setTimeout(() => {
          const success = Math.random() > 0.15;
          setDefenses(prev => prev.map(d => d.id === defense.id ? progressDefense(d, success) : d));
          onLogGenerated({
            id: (Date.now() + 2).toString(),
            timestamp: new Date().toLocaleTimeString(),
            source: availableAgent.name,
            level: success ? 'SUCCESS' : 'CRITICAL',
            message: success
              ? `✓ Attack blocked: ${defense.mitigation}`
              : `✗ Mitigation failed - escalating`,
            agentType: 'BLUE'
          });
          onAgentUpdate(getAgentSnapshots(AgentType.BLUE));
        }, 4000);

      } catch (error: any) {
        onLogGenerated({
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          source: availableAgent.name,
          level: 'CRITICAL',
          message: `Defense error: ${error.message}`,
          agentType: 'BLUE'
        });
      }
    };

    handleIncomingAttack(latestAttack);
  }, [incomingAttacks]);

  useEffect(() => {
    setStats({
      totalAttacks: defenses.length,
      blocked:   defenses.filter(d => d.status === DefenseStatus.BLOCKED).length,
      analyzing: defenses.filter(d => d.status === DefenseStatus.ANALYZING || d.status === DefenseStatus.MITIGATING).length,
      failed:    defenses.filter(d => d.status === DefenseStatus.FAILED).length
    });
  }, [defenses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-900/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Shield className="text-blue-400" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-blue-400">Blue Team Operations</h2>
            <p className="text-slate-400 text-sm">Defensive Security - Automated Threat Response</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-950/30 border border-blue-900/50 rounded-lg">
          <Activity className="text-blue-400 animate-pulse" size={16} />
          <span className="text-blue-400 font-mono text-sm">AUTO-DEFENSE ACTIVE</span>
        </div>
      </div>

      {/* Defense Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Total Threats</span>
            <AlertTriangle className="text-yellow-400" size={20} />
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalAttacks}</div>
        </div>

        <div className="bg-slate-900/50 border border-green-900/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Blocked</span>
            <CheckCircle className="text-green-400" size={20} />
          </div>
          <div className="text-3xl font-bold text-green-400">{stats.blocked}</div>
        </div>

        <div className="bg-slate-900/50 border border-blue-900/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Analyzing</span>
            <Activity className="text-blue-400 animate-pulse" size={20} />
          </div>
          <div className="text-3xl font-bold text-blue-400">{stats.analyzing}</div>
        </div>

        <div className="bg-slate-900/50 border border-red-900/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Failed</span>
            <XCircle className="text-red-400" size={20} />
          </div>
          <div className="text-3xl font-bold text-red-400">{stats.failed}</div>
        </div>
      </div>

      {/* Agent Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
          Defense Agents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* Active Defenses */}
      {defenses.length > 0 && (
        <div className="bg-slate-900/50 border border-blue-900/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
            <Shield size={20} />
            Defense Operations ({defenses.length})
          </h3>
          <div className="space-y-3">
            {defenses.slice(-5).reverse().map((defense) => {
              const attack = incomingAttacks.find(a => a.id === defense.attackId);
              
              return (
                <div
                  key={defense.id}
                  className="bg-slate-950 border border-blue-900/50 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded text-xs font-bold ${
                        defense.status === DefenseStatus.ANALYZING  ? 'bg-yellow-900/30 text-yellow-400' :
                        defense.status === DefenseStatus.MITIGATING ? 'bg-blue-900/30 text-blue-400' :
                        defense.status === DefenseStatus.BLOCKED    ? 'bg-green-900/30 text-green-400' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {defense.status}
                      </div>
                      <span className="font-bold text-white">
                        vs {incomingAttacks.find(a => a.id === defense.attackId)?.type || 'Unknown Threat'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-mono">
                        {new Date(defense.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-blue-400 font-bold">
                        Confidence: {defense.confidence}%
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-300 mb-2">
                    <span className="text-slate-500">Analysis:</span> {defense.analysis}
                  </div>
                  <div className="text-sm text-blue-300">
                    <span className="text-slate-500">Mitigation:</span> {defense.mitigation}
                  </div>
                  {defense.ragSourcesUsed?.length > 0 && (
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {defense.ragSourcesUsed.map(s => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 bg-purple-900/30 text-purple-400 rounded font-mono">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Terminal Logs */}
      <div className="h-96">
        <Terminal 
          logs={logs.filter(l => l.type === AgentType.BLUE)} 
          title="BLUE TEAM DEFENSE LOG" 
        />
      </div>
    </div>
  );
};
