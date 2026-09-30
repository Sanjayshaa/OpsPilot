import React, { useState, useEffect } from 'react';
import { fetchDashboard, fetchContainers } from '../api';
import KpiCard from '../components/KpiCard';
import StatusBadge from '../components/StatusBadge';
import { 
  Boxes, 
  Play, 
  Square, 
  Server, 
  Rocket, 
  Trash2, 
  ArrowUpRight,
  Layers,
  Network,
  Database
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, contRes] = await Promise.all([
        fetchDashboard(),
        fetchContainers()
      ]);
      setData(dashRes);
      setContainers(Array.isArray(contRes) ? contRes : []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-devops-cyan border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-mono text-slate-400">Connecting to Docker Engine API...</p>
        </div>
      </div>
    );
  }

  const engine = data?.engine || {};
  const containerStats = data?.containers || {};
  const isDemo = engine.mode === 'DEMO';

  return (
    <div className="space-y-6">
      {/* Engine Status Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-devops-blue to-devops-cyan text-white shadow-neon-blue">
            <Server className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Docker Engine Operations Center</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${isDemo ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                {engine.display || (isDemo ? '🟡 Demo Mode' : '🟢 Live Docker Engine')}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Engine Version: <span className="text-devops-cyan">{engine.version || '28.0.0'}</span> | API v{engine.api || '1.48'} | Storage Driver: <span className="text-slate-300">{engine.storage_driver || 'overlay2'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/deploy"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-devops-blue to-devops-cyan text-white font-semibold text-xs shadow-neon-cyan hover:opacity-90 transition-all"
          >
            <Rocket className="w-4 h-4" />
            <span>Deploy Container</span>
          </Link>
          <Link
            to="/resources"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
          >
            <Trash2 className="w-4 h-4 text-devops-rose" />
            <span>System Prune</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Containers"
          value={containerStats.total ?? 0}
          subtext="Docker Engine socket scope"
          icon={Boxes}
          color="blue"
          badgeText="Containers"
        />
        <KpiCard
          title="Running Containers"
          value={containerStats.running ?? 0}
          subtext="Healthy active workloads"
          icon={Play}
          color="emerald"
          badgeText="Active"
        />
        <KpiCard
          title="Stopped Containers"
          value={containerStats.stopped ?? 0}
          subtext="Exited or halted state"
          icon={Square}
          color="amber"
          badgeText="Standby"
        />
        <KpiCard
          title="Docker Images"
          value={data?.images ?? 0}
          subtext="Local image cache"
          icon={Layers}
          color="cyan"
          badgeText="Images"
        />
      </div>

      {/* Docker Engine Storage & Workloads Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engine Specification Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-1 space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Server className="w-4 h-4 text-devops-cyan" /> Engine Details
          </h4>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Storage Driver</span>
              <span className="text-devops-cyan font-bold">{engine.storage_driver || 'overlay2'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Persistent Volumes</span>
              <span className="text-devops-purple font-bold flex items-center gap-1">
                <Database className="w-3.5 h-3.5" /> {data?.volumes ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Docker Networks</span>
              <span className="text-devops-emerald font-bold flex items-center gap-1">
                <Network className="w-3.5 h-3.5" /> {data?.networks ?? 0}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-devops-blue/10 border border-devops-blue/30 text-slate-300 leading-relaxed text-[11px]">
              <p className="font-semibold text-devops-blue mb-1">Engine Operational Status</p>
              OpsPilot is directly monitoring container processes via Docker Engine socket API.
            </div>
          </div>
        </div>

        {/* Containers Snapshot Table */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-devops-blue" /> Container Workload Snapshot
            </h4>
            <Link to="/containers" className="text-xs text-devops-cyan hover:underline flex items-center gap-1">
              Manage All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 px-2">Container Name</th>
                  <th className="pb-3 px-2">Image</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2">Ports</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {containers.slice(0, 5).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-2 font-semibold text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-devops-cyan"></div>
                      {c.name}
                    </td>
                    <td className="py-3 px-2 text-slate-300">{c.image}</td>
                    <td className="py-3 px-2">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-2 text-slate-400 text-[11px] truncate max-w-[200px]">
                      {c.ports || 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
