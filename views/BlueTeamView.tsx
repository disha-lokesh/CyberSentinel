import React, { useEffect, useState } from 'react';
import { Agent, AgentStatus, AgentType, LogEntry } from '../types';
import { AgentCard } from '../components/AgentCard';
import { Terminal } from '../components/Terminal';
import { Shield, Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { 
  AttackResult,
  DefenseResult,
  executeBlueTeamDefense,
  progressDefense
} from '../services/agentService';

interface BlueTeamViewProps {
  agents: Agent[];
  onAgentUpdate: (agents: Agent[]) => void;
  onLogGenerated: (log: any) => void;
  incomingAttacks: AttackResult[];
  logs: LogEntry[];
}

export const BlueTeamView: React.FC<BlueTeamViewProps> = ({ 
  agents, 
  onAgentUpdate,
  onLogGenerated,
  incomingAttacks,
  logs
}) => {
  const [defenses, setDefenses] = useState<DefenseResult[]>([]);
  const [stats, setStats] = useState({
    totalAttacks: 0,
    blocked: 0,
    analyzing: 0,
    failed: 0
  });

  // Automated defense system - responds to incoming attacks
  useEffect(() => {
    const handleIncomingAttack = async (attack: AttackResult) => {
      // Check if already defending against this attack
      if (defenses.some(d => d.attackId === attack.id)) return;

      // Select best agent for this threat
      const availableAgent = agents.find(a => a.status === AgentStatus.IDLE) || agents[0];

      // Update agent status
      const updatedAgents = agents.map(a => 
        a.id === availableAgent.id 
          ? { ...a, status: AgentStatus.ANALYZING, currentTask: `Analyzing ${attack.type}` }
          : a
      );
      onAgentUpdate(updatedAgents);

      // Log detection
      onLogGenerated({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        source: availableAgent.name,
        level: 'WARN',
        message: `Threat detected: ${attack.type}`,
        type: AgentType.BLUE
      });

      try {
        // Execute automated defense
        const defense = await executeBlueTeamDefense(attack, availableAgent);
        setDefenses(prev => [...prev, defense]);

        // Log analysis
        onLogGenerated({
          id: (Date.now() + 1).toString(),
          timestamp: new Date().toLocaleTimeString(),
          source: availableAgent.name,
          level: 'INFO',
          message: `Analysis: ${defense.analysis}`,
          type: AgentType.BLUE
        });

        // Progress defense
        setTimeout(() => {
          setDefenses(prev => 
            prev.map(d => d.id === defense.id ? progressDefense(d, true) : d)
          );

          // Update agent to mitigating
          const mitigatingAgents = agents.map(a => 
            a.id === availableAgent.id 
              ? { ...a, status: AgentStatus.MITIGATING, currentTask: `Mitigating ${attack.type}` }
              : a
          );
          onAgentUpdate(mitigatingAgents);
        }, 2000);

        // Complete defense
        setTimeout(() => {
          const success = Math.random() > 0.2; // 80% success rate
          setDefenses(prev => 
            prev.map(d => d.id === defense.id ? progressDefense(d, success) : d)
          );

          // Log result
          onLogGenerated({
            id: (Date.now() + 2).toString(),
            timestamp: new Date().toLocaleTimeString(),
            source: availableAgent.name,
            level: success ? 'SUCCESS' : 'CRITICAL',
            message: success 
              ? `✓ Attack blocked: ${defense.mitigation}` 
              : `✗ Mitigation failed - Manual intervention required`,
            type: AgentType.BLUE
          });

          // Reset agent
          const resetAgents = agents.map(a => 
            a.id === availableAgent.id 
              ? { ...a, status: AgentStatus.IDLE, currentTask: 'Monitoring for threats' }
              : a
          );
          onAgentUpdate(resetAgents);
        }, 4000);

      } catch (error) {
        console.error('Defense execution failed:', error);
        onLogGenerated({
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          source: availableAgent.name,
          level: 'CRITICAL',
          message: `Defense system error: ${error}`,
          type: AgentType.BLUE
        });
      }
    };

    // Monitor for new attacks
    const latestAttack = incomingAttacks[incomingAttacks.length - 1];
    if (latestAttack && latestAttack.status === 'DETECTED') {
      handleIncomingAttack(latestAttack);
    }
  }, [incomingAttacks]);

  // Update stats
  useEffect(() => {
    setStats({
      totalAttacks: defenses.length,
      blocked: defenses.filter(d => d.status === 'BLOCKED').length,
      analyzing: defenses.filter(d => d.status === 'ANALYZING' || d.status === 'MITIGATING').length,
      failed: defenses.filter(d => d.status === 'FAILED').length
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
                        defense.status === 'ANALYZING' ? 'bg-yellow-900/30 text-yellow-400' :
                        defense.status === 'MITIGATING' ? 'bg-blue-900/30 text-blue-400' :
                        defense.status === 'BLOCKED' ? 'bg-green-900/30 text-green-400' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {defense.status}
                      </div>
                      <span className="font-bold text-white">
                        vs {attack?.type || 'Unknown Threat'}
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
