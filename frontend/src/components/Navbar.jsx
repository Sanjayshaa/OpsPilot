import React from 'react';
import { RefreshCw, Search, Cpu, HardDrive, Bell } from 'lucide-react';

export default function Navbar({ title, onRefresh, isRefreshing }) {
  return (
    <header className="glass-panel border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-xs text-slate-400 font-mono">Control Center & Overview</p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search Input */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search containers, images..."
            className="pl-9 pr-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-devops-cyan focus:ring-1 focus:ring-devops-cyan transition-all w-64"
          />
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all hover:border-devops-cyan/50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-devops-cyan' : 'text-slate-400'}`} />
          <span>Refresh</span>
        </button>

        {/* System Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-devops-blue/10 border border-devops-blue/30 text-devops-blue text-xs font-mono font-medium">
          <Cpu className="w-3.5 h-3.5" />
          <span>Docker Engine</span>
        </div>
      </div>
    </header>
  );
}
