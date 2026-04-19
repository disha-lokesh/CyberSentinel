/**
 * API client — all calls go to the Python FastAPI backend.
 */
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

export const api = {
  getRedAgents:    () => fetch(`${BASE}/agents/red`).then(r => r.json()),
  getBlueAgents:   () => fetch(`${BASE}/agents/blue`).then(r => r.json()),
  getOrchestrator: () => fetch(`${BASE}/agents/orchestrator`).then(r => r.json()),
  getAttacks:      () => fetch(`${BASE}/attacks`).then(r => r.json()),
  getDefenses:     () => fetch(`${BASE}/defenses`).then(r => r.json()),
  getReport:       () => fetch(`${BASE}/reports/summary`).then(r => r.json()),

  launchAttack: (attack_type, target = "Enterprise Web Application") =>
    fetch(`${BASE}/attack/launch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attack_type, target }),
    }).then(r => r.json()),

  orchestratorAnalyze: () =>
    fetch(`${BASE}/orchestrator/analyze`, { method: "POST" }).then(r => r.json()),

  launchManualAttack: (attack_type, target) =>
    fetch(`${BASE}/attack/manual`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attack_type, target }),
    }).then(r => r.json()),

  // Real HTTP attack scanner — call on every form submit, search, login
  scanRequest: (method, path, query = "", body = "") =>
    fetch(`${BASE}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, path, query, body, source_ip: "browser" }),
    }).then(r => r.json()).catch(() => ({ detected: false })),
};

/**
 * WebSocket connection — real-time events from backend.
 * @param {function} onMessage - callback(event, payload)
 */
export function connectWS(onMessage) {
  const wsUrl = (import.meta.env.VITE_API_URL || "http://localhost:8001")
    .replace("http", "ws") + "/api/ws";

  const ws = new WebSocket(wsUrl);

  ws.onmessage = (e) => {
    try {
      const { event, payload } = JSON.parse(e.data);
      onMessage(event, payload);
    } catch { /* ignore malformed */ }
  };

  ws.onerror = (e) => console.error("WS error", e);

  return ws;
}
