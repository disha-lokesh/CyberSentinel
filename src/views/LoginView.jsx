import { useState } from "react";
import { Shield, Eye, EyeOff, Lock, User, AlertTriangle } from "lucide-react";

// Demo credentials — in production these would be validated server-side
const ANALYSTS = [
  { username: "analyst",  password: "cyber2024", name: "Alex Chen",    role: "SOC Analyst L2",    clearance: "SECRET" },
  { username: "lead",     password: "sentinel1", name: "Sarah Malik",  role: "SecOps Lead",       clearance: "TOP SECRET" },
  { username: "forensics",password: "forensic1", name: "James Rivera", role: "Forensics Analyst", clearance: "SECRET" },
];

export default function LoginView({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise(r => setTimeout(r, 800)); // simulate auth

    const analyst = ANALYSTS.find(
      a => a.username === username.toLowerCase() && a.password === password
    );

    if (analyst) {
      onLogin(analyst);
    } else {
      setError("Invalid credentials. Access denied.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden">

      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl shadow-purple-500/30 mb-6">
            <Shield size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">CyberSentinel</h1>
          <p className="text-slate-400 mt-2 font-mono text-sm tracking-widest uppercase">
            Gemini 3 Agentic Platform
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-red-950/40 border border-red-900/50 rounded-full">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-xs font-mono">RESTRICTED ACCESS — AUTHORIZED PERSONNEL ONLY</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Analyst Authentication</h2>
            <p className="text-slate-400 text-sm mt-1">Enter your SOC credentials to access the platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Analyst ID
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="analyst"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Access Code
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-12 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-900/50 rounded-lg">
                <AlertTriangle size={16} className="text-red-400 shrink-0" />
                <span className="text-red-400 text-sm font-mono">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                loading
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-purple-900/30"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Authenticating...
                </span>
              ) : "Access Platform"}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 p-3 bg-slate-950/50 border border-slate-800 rounded-lg">
            <p className="text-xs text-slate-500 font-mono mb-1">Demo credentials:</p>
            <p className="text-xs text-slate-400 font-mono">analyst / cyber2024</p>
            <p className="text-xs text-slate-400 font-mono">lead / sentinel1</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6 font-mono">
          Powered by Gemini 3 · Gemini 3 Hackathon 2025
        </p>
      </div>
    </div>
  );
}
