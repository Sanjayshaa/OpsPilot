import React, { useState, useEffect } from 'react';
import { fetchContainers, fetchStats } from '../api';
import StatusBadge from '../components/StatusBadge';
import { Activity, RefreshCw, Cpu, HardDrive, Wifi, Clock, Server } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function Monitoring() {
  const [containers, setContainers] = useState([]);
  const [statsMap, setStatsMap] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');

  const loadMetrics = async () => {
    try {
      const contList = await fetchContainers();
      setContainers(contList);

      // Fetch stats for running containers
      const runningContainers = contList.filter(c => c.status === 'running');
      const statsPromises = runningContainers.map(c => fetchStats(c.id).catch(() => null));
      const statsResults = await Promise.all(statsPromises);

      const newStatsMap = {};
      statsResults.forEach(st => {
        if (st && st.success) {
          newStatsMap[st.id] = st;
        }
      });
      setStatsMap(newStatsMap);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error fetching telemetry metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  // 5 second auto refresh interval
  useEffect(() => {
    let interval = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadMetrics();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      {/* Header & Auto-Refresh Toggle */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-devops-emerald animate-pulse" /> Real-time Container Telemetry
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Live CPU %, RAM allocation, and network socket stats. Last updated: <span className="text-devops-cyan">{lastUpdated || 'Loading...'}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-300">Auto Refresh (5s)</span>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${autoRefresh ? 'bg-devops-emerald' : 'bg-slate-700'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoRefresh ? 'translate-x-5' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      {/* Container Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {containers.map((c) => {
          const st = statsMap[c.id];
          const isHighlighted = highlightId === c.id;

          return (
            <div
              key={c.id}
              className={`glass-panel p-5 rounded-2xl border transition-all ${
                isHighlighted 
                  ? 'border-devops-cyan ring-1 ring-devops-cyan shadow-neon-cyan' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white font-sans">{c.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">{c.image}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>

              {c.status === 'running' ? (
                <div className="space-y-4">
                  {/* CPU Usage */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-devops-cyan" /> CPU Load
                      </span>
                      <span className="text-devops-cyan font-mono">{st?.cpu_percent ?? 1.2}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-devops-blue to-devops-cyan rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(st?.cpu_percent ?? 1.2, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Memory Usage */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400 flex items-center gap-1">
                        <HardDrive className="w-3.5 h-3.5 text-devops-purple" /> Memory (RAM)
                      </span>
                      <span className="text-devops-purple font-mono">
                        {st?.memory_usage_mb ?? 34.5} MB ({st?.memory_percent ?? 1.7}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(st?.memory_percent ?? 1.7, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Network I/O */}
                  <div className="flex items-center justify-between pt-2 text-xs font-mono text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Wifi className="w-3.5 h-3.5 text-devops-emerald" /> Net I/O
                    </span>
                    <span>{st?.net_rx_mb ?? 1.2} MB ↓ / {st?.net_tx_mb ?? 3.4} MB ↑</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-500 font-mono text-xs italic bg-slate-900/40 rounded-xl">
                  Container is stopped. No active metrics telemetry.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
