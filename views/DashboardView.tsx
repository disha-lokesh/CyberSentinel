import React from 'react';
import { Agent, LogEntry, MetricData, Threat } from '../types';
import { Terminal } from '../components/Terminal';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ShieldAlert, ShieldCheck, Activity, Globe } from 'lucide-react';

interface DashboardProps {
  metrics: MetricData[];
  logs: LogEntry[];
  threats: Threat[];
}

export const DashboardView: React.FC<DashboardProps> = ({ metrics, logs, threats }) => {
  const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex items-start justify-between hover:border-slate-700 transition-colors">
      <div>
        <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
        <p className={`text-xs ${color}`}>{sub}</p>
      </div>
      <div className={`p-3 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
        <Icon size={24} className={color} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Threats" 
          value={threats.length.toString()} 
          sub="+2 since last hour" 
          icon={ShieldAlert} 
          color="text-red-500" 
        />
        <StatCard 
          title="Attacks Blocked" 
          value="1,284" 
          sub="98.2% Success Rate" 
          icon={ShieldCheck} 
          color="text-blue-500" 
        />
        <StatCard 
          title="System Load" 
          value="45%" 
          sub="Optimal Performance" 
          icon={Activity} 
          color="text-green-500" 
        />
        <StatCard 
          title="Global Nodes" 
          value="12" 
          sub="All Regions Active" 
          icon={Globe} 
          color="text-purple-500" 
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6 h-[500px]">
        
        {/* Traffic Chart */}
        <div className="col-span-8 bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-200">Network Threat Velocity</h3>
             <div className="flex gap-2 text-xs">
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-sm"></div>Attack</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div>Defense</span>
             </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="attacks" stroke="#ef4444" fillOpacity={1} fill="url(#colorAttacks)" />
                <Area type="monotone" dataKey="blocked" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBlocked)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Logs */}
        <div className="col-span-4 h-full">
            <Terminal logs={logs} title="LIVE EVENT STREAM" />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Active Threats */}
         <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="font-bold text-slate-200 mb-4">Active Threat Vectors</h3>
            <div className="space-y-3">
               {threats.map(t => (
                 <div key={t.id} className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800 hover:border-red-900/50 transition-colors group">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-red-500/10 rounded text-red-500 group-hover:text-red-400">
                          <ShieldAlert size={16} />
                       </div>
                       <div>
                          <p className="text-sm font-medium text-slate-200">{t.name}</p>
                          <p className="text-xs text-slate-500">{t.vector}</p>
                       </div>
                    </div>
                    <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white mb-1">
                           {t.severity}
                        </span>
                        <p className="text-xs text-slate-500">{t.confidence}% Conf.</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Compliance / Health */}
         <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
             <h3 className="font-bold text-slate-200 mb-4">System Resilience Score</h3>
             <div className="flex items-center gap-8 mb-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                       <circle cx="64" cy="64" r="56" stroke="#1e293b" strokeWidth="12" fill="none" />
                       <circle cx="64" cy="64" r="56" stroke="#10b981" strokeWidth="12" fill="none" strokeDasharray="351.86" strokeDashoffset="35.18" />
                    </svg>
                    <span className="absolute text-3xl font-bold text-white">90</span>
                </div>
                <div className="flex-1 space-y-4">
                    <div>
                       <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Patch Compliance</span>
                          <span className="text-white">98%</span>
                       </div>
                       <div className="w-full bg-slate-800 h-1.5 rounded-full"><div className="w-[98%] bg-blue-500 h-full rounded-full"></div></div>
                    </div>
                    <div>
                       <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Identity Health</span>
                          <span className="text-white">85%</span>
                       </div>
                       <div className="w-full bg-slate-800 h-1.5 rounded-full"><div className="w-[85%] bg-yellow-500 h-full rounded-full"></div></div>
                    </div>
                    <div>
                       <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Data Encryption</span>
                          <span className="text-white">100%</span>
                       </div>
                       <div className="w-full bg-slate-800 h-1.5 rounded-full"><div className="w-full bg-green-500 h-full rounded-full"></div></div>
                    </div>
                </div>
             </div>
         </div>
      </div>
    </div>
  );
};