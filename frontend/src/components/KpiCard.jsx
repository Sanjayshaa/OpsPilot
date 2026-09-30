import React from 'react';

export default function KpiCard({ title, value, subtext, icon: Icon, color = 'blue', badgeText }) {
  const colorMap = {
    blue: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/30 shadow-neon-blue',
    cyan: 'from-cyan-500/20 to-cyan-600/5 text-cyan-400 border-cyan-500/30 shadow-neon-cyan',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30 shadow-neon-emerald',
    purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/30',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/30',
    rose: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/30',
  };

  const iconBgMap = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  return (
    <div className={`glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden group border`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${colorMap[color] || colorMap.blue} rounded-bl-full opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-30`}></div>
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${iconBgMap[color] || iconBgMap.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        {badgeText && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
            {badgeText}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
          {subtext}
        </p>
      )}
    </div>
  );
}
