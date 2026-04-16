import { useState, useEffect, useCallback } from "react";
import Layout from "./components/Layout";
import LoginView from "./views/LoginView";
import DashboardView from "./views/DashboardView";
import BlueTeamView from "./views/BlueTeamView";
import OrchestratorView from "./views/OrchestratorView";
import WorkflowView from "./views/WorkflowView";
import ReportingView from "./views/ReportingView";
import { api } from "./api/client";
import { useWebSocket } from "./hooks/useWebSocket";

export default function App() {
  const [analyst, setAnalyst]   = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("analyst")); } catch { return null; }
  });
  const [view, setView]         = useState("dashboard");
  const [redAgents, setRed]     = useState([]);
  const [blueAgents, setBlue]   = useState([]);
  const [attacks, setAttacks]   = useState([]);
  const [defenses, setDefenses] = useState([]);
  const [logs, setLogs]         = useState([]);

  // ── Load initial state from backend ──────────────────────────
  useEffect(() => {
    if (!analyst) return;
    api.getRedAgents().then(setRed).catch(console.error);
    api.getBlueAgents().then(setBlue).catch(console.error);
    api.getAttacks().then(setAttacks).catch(console.error);
    api.getDefenses().then(setDefenses).catch(console.error);
  }, [analyst]);

  // ── WebSocket real-time updates ───────────────────────────────
  const handleWS = useCallback((event, payload) => {
    if (!analyst) return;
    const ts = new Date().toLocaleTimeString();

    switch (event) {
      case "connected":
        if (payload.red_agents)  setRed(payload.red_agents);
        if (payload.blue_agents) setBlue(payload.blue_agents);
        if (payload.attacks)     setAttacks(payload.attacks);
        if (payload.defenses)    setDefenses(payload.defenses);
        break;

      case "attack_initiated":
      case "attack_updated":
        setAttacks(prev => {
          const exists = prev.find(a => a.id === payload.id);
          return exists
            ? prev.map(a => a.id === payload.id ? payload : a)
            : [...prev, payload];
        });
        addLog(payload.agent_name, "WARN",
          `${payload.type}: ${payload.strategy?.slice(0, 80)}`, "RED", ts);
        break;

      case "defense_analyzing":
      case "defense_updated":
      case "defense_completed":
        setDefenses(prev => {
          const exists = prev.find(d => d.id === payload.id);
          return exists
            ? prev.map(d => d.id === payload.id ? payload : d)
            : [...prev, payload];
        });
        addLog(payload.agent_name,
          payload.status === "BLOCKED" ? "SUCCESS" : "INFO",
          `${payload.status}: ${payload.mitigation?.slice(0, 80)}`, "BLUE", ts);
        break;

      case "defense_started":
        addLog(payload.agent, "INFO",
          `Responding to attack ${payload.attack_id}`, "BLUE", ts);
        break;

      case "orchestrator_decision":
        addLog("Orchestrator", "INFO",
          payload.threat_assessment?.slice(0, 100), "ORCHESTRATOR", ts);
        break;
    }
  }, [analyst]);

  useWebSocket(handleWS);

  function addLog(source, level, message, agentType, timestamp) {
    setLogs(prev => [{
      id: `${Date.now()}-${Math.random()}`,
      timestamp, source, level, message, agentType,
    }, ...prev].slice(0, 100));
  }

  // ── Auth ──────────────────────────────────────────────────────
  const handleLogin = (analystData) => {
    sessionStorage.setItem("analyst", JSON.stringify(analystData));
    setAnalyst(analystData);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("analyst");
    setAnalyst(null);
    setView("dashboard");
    setAttacks([]);
    setDefenses([]);
    setLogs([]);
  };

  // ── Login gate ────────────────────────────────────────────────
  if (!analyst) {
    return <LoginView onLogin={handleLogin} />;
  }

  // ── Analyst views (no Red Team view — agents run autonomously) ─
  const views = {
    dashboard:    <DashboardView attacks={attacks} defenses={defenses} logs={logs} redAgents={redAgents} blueAgents={blueAgents} />,
    "blue-team":  <BlueTeamView agents={blueAgents} defenses={defenses} logs={logs} />,
    orchestrator: <OrchestratorView attacks={attacks} defenses={defenses} redAgents={redAgents} blueAgents={blueAgents} />,
    workflow:     <WorkflowView attacks={attacks} defenses={defenses} redAgents={redAgents} blueAgents={blueAgents} />,
    reporting:    <ReportingView />,
  };

  return (
    <Layout activeView={view} onNavigate={setView} analyst={analyst} onLogout={handleLogout}>
      {views[view] || <div className="text-slate-400">Module under construction...</div>}
    </Layout>
  );
}
