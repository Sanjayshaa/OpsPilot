import React, { useState, useEffect } from 'react';
import { 
  fetchContainers, 
  startContainer, 
  stopContainer, 
  restartContainer, 
  deleteContainer,
  inspectContainer
} from '../api';
import StatusBadge from '../components/StatusBadge';
import { 
  Search, 
  Play, 
  Square, 
  RotateCw, 
  Trash2, 
  Terminal, 
  Activity, 
  Boxes,
  CheckCircle,
  AlertCircle,
  Code,
  X,
  Copy,
  Check,
  Server,
  Network,
  HardDrive,
  HeartPulse
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Containers() {
  const [containers, setContainers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null);
  
  // Inspect Modal State
  const [inspectData, setInspectData] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectContainerName, setInspectContainerName] = useState('');
  const [inspectTab, setInspectTab] = useState('general');
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  const loadContainers = async () => {
    try {
      setLoading(true);
      const res = await fetchContainers();
      setContainers(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load containers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContainers();
  }, []);

  const handleAction = async (actionFn, id, actionName) => {
    try {
      setActiveActionId(id);
      const res = await actionFn(id);
      setActionMessage({ type: 'success', text: res.message || `${actionName} command executed successfully` });
      await loadContainers();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || `Failed to ${actionName}` });
    } finally {
      setActiveActionId(null);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleInspect = async (id, name) => {
    try {
      setInspectContainerName(name);
      setInspectLoading(true);
      setInspectTab('general');
      const res = await inspectContainer(id);
      setInspectData(res);
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to inspect container' });
    } finally {
      setInspectLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (inspectData) {
      navigator.clipboard.writeText(JSON.stringify(inspectData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const filteredContainers = containers.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.image.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'running') return matchesSearch && c.status === 'running';
    if (filterStatus === 'stopped') return matchesSearch && (c.status === 'stopped' || c.status.includes('Exited'));
    if (filterStatus === 'paused') return matchesSearch && c.status === 'paused';
    if (filterStatus === 'restarting') return matchesSearch && c.status === 'restarting';
    if (filterStatus === 'healthy') return matchesSearch && c.health_status === 'healthy';
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {actionMessage && (
        <div className={`p-4 rounded-xl flex items-center justify-between border ${actionMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
          <div className="flex items-center gap-2 text-sm font-semibold">
            {actionMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{actionMessage.text}</span>
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by container name, ID, or image..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-devops-cyan focus:ring-1 focus:ring-devops-cyan transition-all"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          {['all', 'running', 'stopped', 'paused', 'restarting', 'healthy'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                filterStatus === st
                  ? 'bg-devops-cyan text-dark-900 shadow-neon-cyan'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Container Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Container ID & Name</th>
                <th className="py-3.5 px-4">Image</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Restart Policy</th>
                <th className="py-3.5 px-4">Ports</th>
                <th className="py-3.5 px-4 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredContainers.map((c) => {
                const isBusy = activeActionId === c.id;
                return (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-devops-cyan shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-white font-sans">{c.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{c.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-300 font-semibold">{c.image}</td>

                    <td className="py-4 px-4">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="py-4 px-4 text-devops-purple font-semibold">
                      {c.restart_policy || 'unless-stopped'}
                    </td>

                    <td className="py-4 px-4 text-slate-400 text-[11px] max-w-[200px] truncate">
                      {c.ports || 'None'}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Inspect Modal Trigger */}
                        <button
                          onClick={() => handleInspect(c.id, c.name)}
                          title="Inspect Container Config"
                          className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition-all"
                        >
                          <Code className="w-3.5 h-3.5" />
                        </button>

                        {/* Start */}
                        {c.status !== 'running' && (
                          <button
                            onClick={() => handleAction(startContainer, c.id, 'start')}
                            disabled={isBusy}
                            title="Start Container"
                            className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all disabled:opacity-50"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Stop */}
                        {c.status === 'running' && (
                          <button
                            onClick={() => handleAction(stopContainer, c.id, 'stop')}
                            disabled={isBusy}
                            title="Stop Container"
                            className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all disabled:opacity-50"
                          >
                            <Square className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Restart */}
                        <button
                          onClick={() => handleAction(restartContainer, c.id, 'restart')}
                          disabled={isBusy}
                          title="Restart Container"
                          className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all disabled:opacity-50"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>

                        {/* Logs */}
                        <button
                          onClick={() => navigate(`/logs?id=${c.id}`)}
                          title="View Live Logs"
                          className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                        </button>

                        {/* Stats */}
                        <button
                          onClick={() => navigate(`/monitoring?id=${c.id}`)}
                          title="View Resource Telemetry"
                          className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition-all"
                        >
                          <Activity className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleAction(deleteContainer, c.id, 'delete')}
                          disabled={isBusy}
                          title="Delete Container"
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabbed Inspect JSON Modal */}
      {(inspectData || inspectLoading) && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-4xl max-h-[88vh] rounded-2xl border border-slate-700 flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                <Code className="w-4 h-4 text-devops-cyan" /> Container Inspection: {inspectContainerName}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-devops-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
                <button
                  onClick={() => setInspectData(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950 px-4 space-x-2">
              {[
                { id: 'general', label: 'General', icon: Server },
                { id: 'env', label: 'Environment', icon: Code },
                { id: 'network', label: 'Network', icon: Network },
                { id: 'volumes', label: 'Volumes', icon: HardDrive },
                { id: 'health', label: 'Health', icon: HeartPulse },
                { id: 'json', label: 'Raw JSON', icon: Code },
              ].map((tb) => {
                const Icon = tb.icon;
                return (
                  <button
                    key={tb.id}
                    onClick={() => setInspectTab(tb.id)}
                    className={`py-2.5 px-3 flex items-center gap-1.5 text-xs font-bold font-mono transition-all border-b-2 ${
                      inspectTab === tb.id
                        ? 'border-devops-cyan text-devops-cyan bg-slate-900/80'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tb.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Content */}
            <div className="p-5 font-mono text-xs text-slate-200 overflow-y-auto max-h-[65vh] terminal-window space-y-4">
              {inspectLoading ? (
                <div className="p-8 text-center text-slate-400">Fetching inspection data from Docker Engine...</div>
              ) : inspectTab === 'json' ? (
                <pre className="whitespace-pre-wrap leading-relaxed text-devops-cyan">
                  {JSON.stringify(inspectData, null, 2)}
                </pre>
              ) : inspectTab === 'general' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[11px] block">Full ID</span>
                      <span className="text-slate-200 text-xs font-bold truncate block">{inspectData?.Id}</span>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[11px] block">Created Timestamp</span>
                      <span className="text-slate-200 text-xs font-bold">{inspectData?.Created}</span>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[11px] block">Path / Entrypoint</span>
                      <span className="text-devops-cyan text-xs font-bold">{inspectData?.Path}</span>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[11px] block">Restart Policy</span>
                      <span className="text-devops-purple text-xs font-bold">{inspectData?.HostConfig?.RestartPolicy?.Name || 'no'}</span>
                    </div>
                  </div>
                </div>
              ) : inspectTab === 'env' ? (
                <div className="space-y-1.5">
                  {(inspectData?.Config?.Env || []).map((ev, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-devops-cyan">
                      {ev}
                    </div>
                  ))}
                </div>
              ) : inspectTab === 'network' ? (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
                    <p><span className="text-slate-400">IP Address:</span> <span className="text-devops-emerald font-bold">{inspectData?.NetworkSettings?.IPAddress || '172.17.0.2'}</span></p>
                    <p><span className="text-slate-400">Gateway:</span> <span className="text-slate-200">{inspectData?.NetworkSettings?.Gateway || '172.17.0.1'}</span></p>
                    <p><span className="text-slate-400">MAC Address:</span> <span className="text-slate-300">{inspectData?.NetworkSettings?.MacAddress || '02:42:ac:11:00:02'}</span></p>
                  </div>
                </div>
              ) : inspectTab === 'volumes' ? (
                <div className="space-y-2">
                  {(inspectData?.Mounts || []).length > 0 ? (
                    inspectData.Mounts.map((m, i) => (
                      <div key={i} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
                        <p><span className="text-slate-400">Source:</span> {m.Source}</p>
                        <p><span className="text-slate-400">Destination:</span> <span className="text-devops-cyan">{m.Destination}</span></p>
                        <p><span className="text-slate-400">Mode:</span> {m.Mode || 'rw'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 italic">No persistent volume mounts attached.</p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                  <p><span className="text-slate-400">Health Status:</span> <span className="text-devops-emerald font-bold">{inspectData?.State?.Health?.Status || 'Healthy (Default)'}</span></p>
                  <p><span className="text-slate-400">Exit Code:</span> {inspectData?.State?.ExitCode ?? 0}</p>
                  <p><span className="text-slate-400">OOM Killed:</span> {inspectData?.State?.OOMKilled ? 'True' : 'False'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
