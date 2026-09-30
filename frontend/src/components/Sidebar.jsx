import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Boxes, 
  Rocket, 
  Activity, 
  Terminal, 
  HardDrive, 
  Trash2, 
  Settings,
  ShieldCheck,
  Server
} from 'lucide-react';

export default function Sidebar({ isMockMode }) {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/containers', label: 'Containers', icon: Boxes },
    { path: '/deploy', label: 'Deploy', icon: Rocket },
    { path: '/monitoring', label: 'Monitoring', icon: Activity },
    { path: '/logs', label: 'Live Logs', icon: Terminal },
    { path: '/resources', label: 'Docker Resources', icon: HardDrive },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 min-h-screen flex flex-col justify-between p-4 sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-3 py-4 mb-6 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-devops-blue to-devops-cyan p-2 flex items-center justify-center shadow-neon-cyan text-white">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-wide text-white flex items-center gap-1.5">
              OpsPilot
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-devops-cyan/20 text-devops-cyan border border-devops-cyan/30">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">Docker Platform</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-devops-blue/20 to-devops-cyan/10 text-devops-cyan border border-devops-cyan/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 mr-3 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-devops-cyan' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info / Engine Badge */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-devops-emerald" /> Engine Status
          </span>
          <span className={`w-2 h-2 rounded-full ${isMockMode ? 'bg-amber-400 animate-pulse' : 'bg-devops-emerald animate-pulse-glow'}`}></span>
        </div>
        <p className="text-[11px] font-mono text-slate-300 font-semibold truncate">
          {isMockMode ? 'Demo Sandbox Engine' : 'Docker Engine Connected'}
        </p>
      </div>
    </aside>
  );
}
