import React, { useState, useEffect } from 'react';
import { fetchResources, runCleanup } from '../api';
import { Layers, HardDrive, Network, Trash2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function Resources() {
  const [resources, setResources] = useState(null);
  const [activeTab, setActiveTab] = useState('images');
  const [loading, setLoading] = useState(true);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupResult, setCleanupResult] = useState(null);

  const loadResources = async () => {
    try {
      setLoading(true);
      const res = await fetchResources();
      setResources(res);
    } catch (err) {
      console.error('Error fetching Docker resources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handlePrune = async () => {
    try {
      setIsCleaning(true);
      const res = await runCleanup();
      setCleanupResult(res);
      await loadResources();
    } catch (err) {
      setCleanupResult({ success: false, error: err.response?.data?.detail || 'Prune failed' });
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-devops-purple" /> Docker Infrastructure Resources
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Manage local images cache, volume persistent storage, virtual bridge networks, and disk usage.
          </p>
        </div>

        <button
          onClick={handlePrune}
          disabled={isCleaning}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
        >
          {isCleaning ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Cleaning Resources...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              <span>One-Click Prune Cleanup</span>
            </>
          )}
        </button>
      </div>

      {/* Cleanup Result Toast */}
      {cleanupResult && (
        <div className={`p-4 rounded-xl flex items-center justify-between border ${cleanupResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
          <div className="flex items-center gap-2 text-sm font-semibold">
            {cleanupResult.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{cleanupResult.message || cleanupResult.error}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        {[
          { id: 'images', label: 'Images Cache', icon: Layers },
          { id: 'volumes', label: 'Volumes Storage', icon: HardDrive },
          { id: 'networks', label: 'Networks', icon: Network },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-devops-cyan text-devops-cyan'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {activeTab === 'images' && (
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase">
                <th className="py-3.5 px-4">Repository / Image ID</th>
                <th className="py-3.5 px-4">Tag</th>
                <th className="py-3.5 px-4">Virtual Size</th>
                <th className="py-3.5 px-4">Created Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(resources?.images || []).map((img, i) => (
                <tr key={i} className="hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-semibold text-white">{img.repository || img.id || 'N/A'}</td>
                  <td className="py-3.5 px-4 text-devops-cyan">{img.tag || img.tags?.[0] || 'latest'}</td>
                  <td className="py-3.5 px-4 text-slate-300">{img.size || `${img.size_mb} MB`}</td>
                  <td className="py-3.5 px-4 text-slate-400">{img.created || 'Available'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'volumes' && (
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase">
                <th className="py-3.5 px-4">Volume Name</th>
                <th className="py-3.5 px-4">Driver</th>
                <th className="py-3.5 px-4">Scope</th>
                <th className="py-3.5 px-4">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(resources?.volumes || []).map((v, i) => (
                <tr key={i} className="hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-semibold text-white">{v.name}</td>
                  <td className="py-3.5 px-4 text-devops-purple">{v.driver}</td>
                  <td className="py-3.5 px-4 text-slate-400">{v.scope || 'local'}</td>
                  <td className="py-3.5 px-4 text-slate-300">{v.size || 'Managed'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'networks' && (
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase">
                <th className="py-3.5 px-4">Network ID & Name</th>
                <th className="py-3.5 px-4">Driver</th>
                <th className="py-3.5 px-4">Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(resources?.networks || []).map((n, i) => (
                <tr key={i} className="hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-semibold text-white">{n.name} ({n.id})</td>
                  <td className="py-3.5 px-4 text-devops-emerald">{n.driver}</td>
                  <td className="py-3.5 px-4 text-slate-400">{n.scope || 'local'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
