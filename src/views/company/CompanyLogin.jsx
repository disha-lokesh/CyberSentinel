import { useState } from "react";
import { Building2, Eye, EyeOff, Lock, User, AlertTriangle, ChevronRight } from "lucide-react";
import { api } from "../../api/client";

const COMPANY_USERS = [
  { username: "alice",   password: "alice123",   name: "Alice Johnson",  role: "Product Manager",    dept: "Product",  avatar: "AJ" },
  { username: "bob",     password: "bob123",     name: "Bob Smith",      role: "Sales Executive",    dept: "Sales",    avatar: "BS" },
  { username: "carol",   password: "carol123",   name: "Carol Davis",    role: "HR Manager",         dept: "HR",       avatar: "CD" },
  { username: "manager", password: "manager123", name: "David Lee",      role: "Engineering Manager",dept: "Eng",      avatar: "DL" },
];

export default function CompanyLogin({ onLogin, onSwitchToSOC }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Real scan on login attempt
    try {
      const scan = await api.scanRequest("POST", "/login", "", `username=${username}&password=${password}`);
      if (scan.detected) {
        setError(`⚠️ Attack detected: ${scan.attack_type} — ${scan.message}`);
        setLoading(false);
        return;
      }
    } catch { /* scan unavailable, continue */ }

    await new Promise(r => setTimeout(r, 600));
    const user = COMPANY_USERS.find(u => u.username === username.toLowerCase() && u.password === password);
    if (user) { onLogin({ ...user, type: "employee" }); }
    else { setError("Invalid credentials. Please try again."); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)",
        backgroundSize: "32px 32px"
      }} />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 mb-4">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">AcmeCorp</h1>
          <p className="text-slate-500 mt-1">Enterprise Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-6">Sign in to your workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email / Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="alice" required
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-10 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle size={14} className="text-red-500 shrink-0" />
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
                loading ? "bg-blue-400 cursor-not-allowed text-white" : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
              }`}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500 font-medium mb-1">Demo accounts:</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-slate-400">
              <span>alice / alice123</span>
              <span>bob / bob123</span>
              <span>carol / carol123</span>
              <span>manager / manager123</span>
            </div>
          </div>
        </div>

        {/* Switch to SOC */}
        <button onClick={onSwitchToSOC}
          className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <span>Security Operations Center</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
