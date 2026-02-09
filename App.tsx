import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { DashboardView } from './views/DashboardView';
import { OrchestratorView } from './views/OrchestratorView';
import { WorkflowView } from './views/WorkflowView';
import { RedTeamView } from './views/RedTeamView';
import { BlueTeamView } from './views/BlueTeamView';
import { ReportingView } from './views/ReportingView';
import { INITIAL_RED_AGENTS, INITIAL_BLUE_AGENTS } from './constants';
import { Agent, AgentType, LogEntry, MetricData, Threat } from './types';
import { AttackResult } from './services/agentService';

// Simulation Service (Inline for simplicity)
const generateMockMetric = (prev: MetricData, time: string): MetricData => {
  const isAttackSpike = Math.random() > 0.8;
  const baseAttacks = isAttackSpike ? 200 + Math.random() * 300 : 50 + Math.random() * 50;
  
  return {
    time,
    attacks: Math.floor(baseAttacks),
    blocked: Math.floor(baseAttacks * (0.8 + Math.random() * 0.15)), // 80-95% block rate
    incidents: isAttackSpike ? Math.floor(Math.random() * 5) : 0
  };
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [redAgents, setRedAgents] = useState<Agent[]>(INITIAL_RED_AGENTS);
  const [blueAgents, setBlueAgents] = useState<Agent[]>(INITIAL_BLUE_AGENTS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [threats, setThreats] = useState<Threat[]>([
    { id: 't1', name: 'SQL Injection Campaign', severity: 'HIGH', status: 'ACTIVE', vector: 'Web Application', confidence: 92 },
    { id: 't2', name: 'Brute Force SSH', severity: 'MEDIUM', status: 'MITIGATED', vector: 'Network', confidence: 88 }
  ]);
  const [activeAttacks, setActiveAttacks] = useState<AttackResult[]>([]);

  const handleAttackLaunched = (attack: AttackResult) => {
    setActiveAttacks(prev => {
      const existing = prev.find(a => a.id === attack.id);
      if (existing) {
        return prev.map(a => a.id === attack.id ? attack : a);
      }
      return [...prev, attack];
    });
  };

  const handleLogGenerated = (log: LogEntry) => {
    setLogs(prev => [...prev.slice(-99), log]);
  };

  // Initial Metrics
  useEffect(() => {
    const initMetrics = [];
    for(let i=0; i<20; i++) {
        initMetrics.push(generateMockMetric({ time: '', attacks: 0, blocked: 0, incidents: 0 }, `${10+i}:00`));
    }
    setMetrics(initMetrics);
  }, []);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      // Update Metrics
      setMetrics(prev => [...prev.slice(1), generateMockMetric(prev[prev.length-1], timeString)]);

    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView metrics={metrics} logs={logs} threats={threats} />;
      case 'workflow':
        return <WorkflowView />;
      case 'orchestrator':
        return <OrchestratorView redAgents={redAgents} blueAgents={blueAgents} />;
      case 'reporting':
        return <ReportingView />;
      case 'red-team':
        return (
          <RedTeamView 
            agents={redAgents}
            onAgentUpdate={setRedAgents}
            onLogGenerated={handleLogGenerated}
            onAttackLaunched={handleAttackLaunched}
            logs={logs}
          />
        );
      case 'blue-team':
        return (
          <BlueTeamView 
            agents={blueAgents}
            onAgentUpdate={setBlueAgents}
            onLogGenerated={handleLogGenerated}
            incomingAttacks={activeAttacks}
            logs={logs}
          />
        );
      default:
        return <div className="text-slate-400">Module under construction...</div>;
    }
  };

  return (
    <Layout activeView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

export default App;