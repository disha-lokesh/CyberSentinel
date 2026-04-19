import { useState, useEffect } from "react";
import {
  Building2, LayoutDashboard, Users, DollarSign, BarChart3,
  Settings, Bell, LogOut, Search, ChevronDown, AlertTriangle,
  Shield, TrendingUp, Package, FileText, Wifi, WifiOff
} from "lucide-react";
import { connectWS } from "../../api/client";

const NAV = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "crm",       icon: Users,           label: "CRM" },
  { id: "finance",   icon: DollarSign,      label: "Finance" },
  { id: "analytics", icon: BarChart3,       label: "Analytics" },
  { id: "products",  icon: Package,         label: "Products" },
  { id: "reports",   icon: FileText,        label: "Reports" },
  { id: "settings",  icon: Settings,        label: "Settings" },
];

export default function CompanyApp({ user, onLogout }) {
  const [view,    setView]    = useState("dashboard");
  const [attacks, setAttacks] = useState([]);
  const [alert,   setAlert]   = useState(null);
  const [wsStatus, setWsStatus] = useState("connecting");

  // Connect to SOC backend to receive attack notifications
  useEffect(() => {
    let ws;
    try {
      ws = connectWS((event, payload) => {
        if (event === "attack_initiated" || event === "attack_updated") {
          setAttacks(prev => {
            const exists = prev.find(a => a.id === payload.id);
            return exists ? prev.map(a => a.id === payload.id ? payload : a) : [...prev, payload];
          });
          // Show alert banner for new attacks
          if (event === "attack_initiated") {
            setAlert({ type: payload.type, target: payload.target, agent: payload.agent_name });
            setTimeout(() => setAlert(null), 6000);
          }
        }
        if (event === "connected") setWsStatus("connected");
      });
      ws.onopen  = () => setWsStatus("connected");
      ws.onerror = () => setWsStatus("error");
      ws.onclose = () => setWsStatus("disconnected");
    } catch { setWsStatus("error"); }
    return () => ws?.close();
  }, []);

  const activeAttacks = attacks.filter(a => ["INITIATED","IN_PROGRESS","DETECTED"].includes(a.status));
  const blockedAttacks = attacks.filter(a => a.status === "BLOCKED");

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20 shadow-sm">
        <div className="h-16 flex items-center px-5 border-b border-slate-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-sm">AcmeCorp</h1>
            <p className="text-[10px] text-slate-400">Enterprise Portal</p>
          </div>
        </div>

        <nav className="flex-1 py-4 space-y-0.5 px-3">
          {NAV.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setView(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                view === id
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        {/* Security status */}
        <div className={`mx-3 mb-3 p-3 rounded-lg border text-xs ${
          activeAttacks.length > 0
            ? "bg-red-50 border-red-200"
            : "bg-green-50 border-green-200"
        }`}>
          <div className="flex items-center gap-2 mb-1">
            {activeAttacks.length > 0
              ? <AlertTriangle size={12} className="text-red-500" />
              : <Shield size={12} className="text-green-500" />}
            <span className={`font-semibold ${activeAttacks.length > 0 ? "text-red-700" : "text-green-700"}`}>
              {activeAttacks.length > 0 ? `${activeAttacks.length} Active Threat${activeAttacks.length > 1 ? "s" : ""}` : "System Secure"}
            </span>
          </div>
          <p className="text-slate-500">{blockedAttacks.length} attacks blocked today</p>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.role}</p>
            </div>
          </div>
          <button onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all text-xs">
            <LogOut size={14} />Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input placeholder="Search..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* SOC connection status */}
            <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
              wsStatus === "connected" ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"
            }`}>
              {wsStatus === "connected" ? <Wifi size={12} /> : <WifiOff size={12} />}
              SOC {wsStatus === "connected" ? "Connected" : "Offline"}
            </div>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={18} />
              {activeAttacks.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {activeAttacks.length}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-800">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {user.avatar}
              </div>
              <span className="font-medium">{user.name.split(" ")[0]}</span>
              <ChevronDown size={14} />
            </div>
          </div>
        </header>

        {/* Attack alert banner */}
        {alert && (
          <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle size={16} className="text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Security Alert: {alert.type} Detected</p>
              <p className="text-xs text-red-600">Target: {alert.target} · SOC team has been notified and is responding</p>
            </div>
            <span className="text-xs text-red-400 font-mono">SOC RESPONDING</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-8">
          {view === "dashboard" && <CompanyDashboard user={user} attacks={attacks} />}
          {view === "crm"       && <CRMPage attacks={attacks} />}
          {view === "finance"   && <FinancePage attacks={attacks} />}
          {view === "analytics" && <AnalyticsPage />}
          {view === "products"  && <ProductsPage />}
          {view === "reports"   && <ReportsPage />}
          {view === "settings"  && <SettingsPage user={user} />}
        </div>
      </main>
    </div>
  );
}

// ── Company Dashboard ─────────────────────────────────────────
function CompanyDashboard({ user, attacks }) {
  const active  = attacks.filter(a => ["INITIATED","IN_PROGRESS","DETECTED"].includes(a.status));
  const blocked = attacks.filter(a => a.status === "BLOCKED");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Good morning, {user.name.split(" ")[0]} 👋</h2>
        <p className="text-slate-500 mt-1">Here's what's happening at AcmeCorp today.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Monthly Revenue",  value: "$2.4M",  change: "+12%",  color: "blue",  icon: DollarSign },
          { label: "Active Users",     value: "1,284",  change: "+5%",   color: "green", icon: Users },
          { label: "Open Tickets",     value: "47",     change: "-8%",   color: "orange",icon: FileText },
          { label: "System Uptime",    value: "99.8%",  change: "stable",color: "purple",icon: TrendingUp },
        ].map(({ label, value, change, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-500 text-sm">{label}</span>
              <div className={`p-2 rounded-lg bg-${color}-50`}>
                <Icon size={18} className={`text-${color}-500`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            <div className={`text-xs mt-1 ${change.startsWith("+") ? "text-green-500" : change.startsWith("-") ? "text-red-500" : "text-slate-400"}`}>
              {change} from last month
            </div>
          </div>
        ))}
      </div>

      {/* Security incidents on this system */}
      {attacks.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-blue-500" />
            <h3 className="font-semibold text-slate-800">Security Incidents</h3>
            <span className="ml-auto text-xs text-slate-400">{blocked.length} blocked · {active.length} active</span>
          </div>
          <div className="space-y-2">
            {attacks.slice(-5).reverse().map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  a.status === "BLOCKED" ? "bg-green-500" :
                  a.status === "SUCCESS" ? "bg-red-500" : "bg-yellow-500 animate-pulse"
                }`} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-slate-700">{a.type}</span>
                  <span className="text-xs text-slate-400 ml-2">on {a.target}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  a.status === "BLOCKED"     ? "bg-green-100 text-green-700" :
                  a.status === "SUCCESS"     ? "bg-red-100 text-red-700" :
                  a.status === "DETECTED"    ? "bg-orange-100 text-orange-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>{a.status}</span>
                <span className="text-xs text-slate-400 font-mono shrink-0">
                  {new Date(a.timestamp * 1000).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: "New deal closed",    user: "Bob Smith",    time: "2m ago",  color: "green" },
              { action: "Support ticket #847",user: "Carol Davis",  time: "15m ago", color: "blue" },
              { action: "Invoice generated",  user: "Finance Bot",  time: "1h ago",  color: "purple" },
              { action: "User onboarded",     user: "HR System",    time: "2h ago",  color: "orange" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full bg-${item.color}-500`} />
                <div className="flex-1">
                  <span className="text-sm text-slate-700">{item.action}</span>
                  <span className="text-xs text-slate-400 ml-2">by {item.user}</span>
                </div>
                <span className="text-xs text-slate-400">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Team Overview</h3>
          <div className="space-y-3">
            {[
              { dept: "Engineering", members: 24, status: "All systems go" },
              { dept: "Sales",       members: 18, status: "Q4 target: 87%" },
              { dept: "HR",          members: 8,  status: "3 open positions" },
              { dept: "Finance",     members: 12, status: "Month-end close" },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                <div>
                  <span className="text-sm font-medium text-slate-700">{t.dept}</span>
                  <span className="text-xs text-slate-400 ml-2">{t.members} members</span>
                </div>
                <span className="text-xs text-slate-500">{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CRM Page ──────────────────────────────────────────────────
function CRMPage({ attacks }) {
  const crmAttacks = attacks.filter(a => a.target?.includes("CRM") || a.type === "SQL Injection" || a.type === "Data Exfiltration");
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Customer Relationship Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage leads, contacts, and deals</p>
        </div>
        {crmAttacks.some(a => a.status !== "BLOCKED") && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            <AlertTriangle size={14} />
            Attack detected on this module
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Leads",    value: "342",  color: "blue" },
          { label: "Active Deals",   value: "89",   color: "green" },
          { label: "Won This Month", value: "$180K", color: "purple" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="text-slate-500 text-sm mb-2">{label}</div>
            <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 font-semibold text-slate-800">Recent Contacts</div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>{["Name","Company","Status","Value","Last Contact"].map(h => <th key={h} className="px-5 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              { name: "John Doe",    company: "TechCorp",   status: "Active",   value: "$45K",  last: "Today" },
              { name: "Jane Smith",  company: "StartupXYZ", status: "Lead",     value: "$12K",  last: "Yesterday" },
              { name: "Mike Brown",  company: "Enterprise", status: "Closed",   value: "$120K", last: "3 days ago" },
              { name: "Sara Wilson", company: "SMB Inc",    status: "Prospect", value: "$8K",   last: "1 week ago" },
            ].map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{r.name}</td>
                <td className="px-5 py-3 text-slate-500">{r.company}</td>
                <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status === "Active" ? "bg-green-100 text-green-700" : r.status === "Closed" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>{r.status}</span></td>
                <td className="px-5 py-3 text-slate-700 font-medium">{r.value}</td>
                <td className="px-5 py-3 text-slate-400">{r.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Finance Page ──────────────────────────────────────────────
function FinancePage({ attacks }) {
  const finAttacks = attacks.filter(a => a.target?.includes("Database") || a.type === "Data Exfiltration");
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Finance</h2>
          <p className="text-slate-500 text-sm mt-1">Revenue, expenses, and financial reports</p>
        </div>
        {finAttacks.some(a => a.status !== "BLOCKED") && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            <AlertTriangle size={14} />Potential data breach detected
          </div>
        )}
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Revenue",   value: "$2.4M",  change: "+12%" },
          { label: "Expenses",  value: "$1.1M",  change: "+3%" },
          { label: "Profit",    value: "$1.3M",  change: "+22%" },
          { label: "Cash Flow", value: "$890K",  change: "+8%" },
        ].map(({ label, value, change }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="text-slate-500 text-sm mb-2">{label}</div>
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            <div className="text-xs text-green-500 mt-1">{change}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4">Recent Transactions</h3>
        <div className="space-y-2">
          {[
            { desc: "Enterprise License - TechCorp",  amount: "+$45,000", date: "Today",     type: "income" },
            { desc: "AWS Infrastructure",             amount: "-$8,200",  date: "Yesterday", type: "expense" },
            { desc: "Consulting Services - StartupXYZ",amount: "+$12,000",date: "2 days ago",type: "income" },
            { desc: "Office Supplies",                amount: "-$340",    date: "3 days ago",type: "expense" },
          ].map((t, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-slate-700">{t.desc}</div>
                <div className="text-xs text-slate-400">{t.date}</div>
              </div>
              <span className={`font-bold text-sm ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>{t.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Simple placeholder pages ──────────────────────────────────
function AnalyticsPage() {
  return <PlaceholderPage title="Analytics" desc="Business intelligence and data visualization" icon={BarChart3} />;
}
function ProductsPage() {
  return <PlaceholderPage title="Products" desc="Product catalog and inventory management" icon={Package} />;
}
function ReportsPage() {
  return <PlaceholderPage title="Reports" desc="Generate and export business reports" icon={FileText} />;
}
function SettingsPage({ user }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-lg">
        <h3 className="font-semibold text-slate-800 mb-4">Profile</h3>
        <div className="space-y-4">
          {[["Full Name", user.name], ["Role", user.role], ["Department", user.dept], ["Username", user.username]].map(([label, value]) => (
            <div key={label}>
              <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
              <input defaultValue={value} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function PlaceholderPage({ title, desc, icon: Icon }) {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon size={32} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-700">{title}</h2>
        <p className="text-slate-400 mt-2">{desc}</p>
      </div>
    </div>
  );
}
