import { useState, useEffect, useCallback } from "react";
import CompanyLogin from "./views/company/CompanyLogin";
import CompanyApp   from "./views/company/CompanyApp";
import LoginView    from "./views/LoginView";
import Layout       from "./components/Layout";
import DashboardView    from "./views/DashboardView";
import BlueTeamView     from "./views/BlueTeamView";
import OrchestratorView from "./views/OrchestratorView";
import WorkflowView     from "./views/WorkflowView";
import ReportingView    from "./views/ReportingView";
import { api } from "./api/client";
import { useWebSocket } from "./hooks/useWebSocket";

// ── Root: choose which portal to show ────────────────────────
export default function App() {
  const [portal, setPortal] = useState(() =>
    sessionStorage.getItem("portal") || "company"   // "company" | "soc"
  );

  const [companyUser, setCompanyUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("companyUser")); } catch { return null; }
  });
  const [analyst, setAnalyst] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("analyst")); } catch { return null; }
  });

  const switchToSOC = () => {
    sessionStorage.setItem("portal", "soc");
    setPortal("soc");
  };
  const switchToCompany = () => {
    sessionStorage.setItem("portal", "company");
    setPortal("company");
  };

  // ── Company portal ────────────────────────────────────────
  if (portal === "company") {
    if (!companyUser) {
      return (
        <CompanyLogin
          onLogin={(u) => {
            sessionStorage.setItem("companyUser", JSON.stringify(u));
            setCompanyUser(u);
          }}
          onSwitchToSOC={switchToSOC}
        />
      );
    }
    return (
      <CompanyApp
        user={companyUser}
        onLogout={() => {
          sessionStorage.removeItem("companyUser");
          setCompanyUser(null);
        }}
      />
    );
  }

  // ── SOC portal ────────────────────────────────────────────
  return (
    <SOCPortal
      analyst={analyst}
      onLogin={(a) => {
        sessionStorage.setItem("analyst", JSON.stringify(a));
        setAnalyst(a);
      }}
      onLogout={() => {
        sessionStorage.removeItem("analyst");
        setAnalyst(null);
      }}
      onSwitchToCompany={switchToCompany}
    />
  );
}

// ── SOC Portal ────────────────────────────────────────────────
function SOCPortal({ analyst, onLogin, onLogout, onSwitchToCompany }) {
  const [view,     setView]     = useState("dashboard");
  const [redAgents, setRed]     = useState([]);
  const [blueAgents, setBlue]   = useState([]);
  const [attacks,  setAttacks]  = useState([]);
  const [defenses, setDefenses] = useState([]);
  const [logs,     setLogs]     = useState([]);

  useEffect(() => {
    if (!analyst) return;
    api.getRedAgents().then(setRed).catch(console.error);
    api.getBlueAgents().then(setBlue).catch(console.error);
    api.getAttacks().then(setAttacks).catch(console.error);
    api.getDefenses().then(setDefenses).catch(console.error);
  }, [analyst]);

  const handleWS = useCallback((event, payload) => {
    if (!analyst) return;
    const ts = new Date().toLocaleTimeString();
    const upsert = (setter, item) =>
      setter(prev => prev.find(x => x.id === item.id)
        ? prev.map(x => x.id === item.id ? item : x)
        : [...prev, item]);

    switch (event) {
      case "connected":
        if (payload.red_agents)  setRed(payload.red_agents);
        if (payload.blue_agents) setBlue(payload.blue_agents);
        if (payload.attacks)     setAttacks(payload.attacks);
        if (payload.defenses)    setDefenses(payload.defenses);
        break;
      case "attack_initiated":
      case "attack_updated":
        upsert(setAttacks, payload);
        addLog(payload.agent_name, "WARN",
          `${payload.type} on ${payload.target}: ${(payload.strategy||"").slice(0,60)}`, "RED", ts);
        break;
      case "defense_started":
        addLog(payload.agent, "INFO", `Responding to ${payload.attack_id}`, "BLUE", ts);
        break;
      case "defense_analyzing":
      case "defense_updated":
      case "defense_completed":
        upsert(setDefenses, payload);
        addLog(payload.agent_name,
          payload.status === "BLOCKED" ? "SUCCESS" : "INFO",
          `${payload.status}: ${(payload.mitigation||"").slice(0,60)}`, "BLUE", ts);
        break;
      case "orchestrator_decision":
        addLog("Orchestrator", "INFO",
          (payload.threat_assessment||"").slice(0,80), "ORCHESTRATOR", ts);
        break;
    }
  }, [analyst]);

  useWebSocket(handleWS);

  useEffect(() => {
    const handler = (e) => setView(e.detail);
    window.addEventListener("navigate", handler);
    return () => window.removeEventListener("navigate", handler);
  }, []);

  function addLog(source, level, message, agentType, timestamp) {
    setLogs(prev => [{
      id: `${Date.now()}-${Math.random()}`,
      timestamp, source, level, message, agentType,
    }, ...prev].slice(0, 100));
  }

  if (!analyst) {
    return (
      <LoginView
        onLogin={onLogin}
        onSwitchToCompany={onSwitchToCompany}
      />
    );
  }

  const views = {
    dashboard:    <DashboardView attacks={attacks} defenses={defenses} logs={logs} redAgents={redAgents} blueAgents={blueAgents} analyst={analyst} />,
    "blue-team":  <BlueTeamView  agents={blueAgents} defenses={defenses} logs={logs} />,
    orchestrator: <OrchestratorView attacks={attacks} defenses={defenses} redAgents={redAgents} blueAgents={blueAgents} />,
    workflow:     <WorkflowView attacks={attacks} defenses={defenses} redAgents={redAgents} blueAgents={blueAgents} />,
    reporting:    <ReportingView />,
  };

  return (
    <Layout activeView={view} onNavigate={setView} analyst={analyst} onLogout={onLogout}>
      {views[view] ?? <div className="text-slate-400">Module under construction...</div>}
    </Layout>
  );
}
