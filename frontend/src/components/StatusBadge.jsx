import React from 'react';

export default function StatusBadge({ status }) {
  const isRunning = status === 'running';
  const isStopped = status === 'stopped' || status?.includes('Exited');
  const isPending = status === 'restarting' || status === 'paused';

  if (isRunning) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-400 animate-pulse-glow"></span>
        Running
      </span>
    );
  }

  if (isStopped) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/30">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-slate-500"></span>
        Stopped
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-400 animate-pulse"></span>
      {status || 'Unknown'}
    </span>
  );
}
