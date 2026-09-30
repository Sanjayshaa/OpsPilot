import React, { useState, useEffect, useRef } from 'react';
import { fetchContainers, fetchLogs } from '../api';
import { Terminal, Download, Search, RefreshCw, Filter, Boxes } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function Logs() {
  const [containers, setContainers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [logs, setLogs] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [logLevelFilter, setLogLevelFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const terminalEndRef = useRef(null);
  const [searchParams] = useSearchParams();
  const paramId = searchParams.get('id');

  useEffect(() => {
    const init = async () => {
      try {
        const list = await fetchContainers();
        setContainers(list);
        if (paramId) {
          setSelectedId(paramId);
        } else if (list.length > 0) {
          setSelectedId(list[0].id);
        }
      } catch (err) {
        console.error('Error fetching containers for logs', err);
      }
    };
    init();
  }, [paramId]);

  const loadContainerLogs = async () => {
    if (!selectedId) return;
    try {
      setLoading(true);
      const res = await fetchLogs(selectedId, 300);
      setLogs(res.logs || '');
    } catch (err) {
      setLogs(`[ERROR] Could not fetch logs for container ID ${selectedId}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContainerLogs();
  }, [selectedId]);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Log filtering logic
  const lines = logs.split('\n');
  const filteredLines = lines.filter((line) => {
    const matchesSearch = line.toLowerCase().includes(searchTerm.toLowerCase());
    if (logLevelFilter === 'INFO') return matchesSearch && line.includes('[INFO]');
    if (logLevelFilter === 'WARN') return matchesSearch && line.includes('[WARN]');
    if (logLevelFilter === 'ERROR') return matchesSearch && (line.includes('[ERROR]') || line.includes('Error'));
    return matchesSearch;
  });

  const handleDownloadLogs = () => {
    const element = document.createElement('a');
    const file = new Blob([logs], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `container-${selectedId}-stdout.log`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Container Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 shrink-0">
            <Boxes className="w-4 h-4 text-devops-cyan" /> Select Container:
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-mono text-slate-200 focus:outline-none focus:border-devops-cyan"
          >
            {containers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          {/* Refresh */}
          <button
            onClick={loadContainerLogs}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-devops-cyan' : 'text-slate-400'}`} />
          </button>

          {/* Download */}
          <button
            onClick={handleDownloadLogs}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-devops-blue/20 text-devops-cyan border border-devops-blue/40 text-xs font-semibold hover:bg-devops-blue/30 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .log</span>
          </button>
        </div>
      </div>

      {/* Search & Level Filters */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search keywords inside logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-mono text-slate-200 focus:outline-none focus:border-devops-cyan"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Level:
          </span>
          {['ALL', 'INFO', 'WARN', 'ERROR'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLogLevelFilter(lvl)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                logLevelFilter === lvl
                  ? 'bg-devops-cyan text-dark-900'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal View */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <span className="ml-2 text-xs font-mono text-slate-400">stdout/stderr stream ({selectedId})</span>
          </div>

          <label className="flex items-center gap-2 text-xs font-mono text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-devops-cyan focus:ring-0"
            />
            <span>Auto Scroll</span>
          </label>
        </div>

        <div className="terminal-window p-5 font-mono text-xs text-slate-300 min-h-[420px] max-h-[550px] overflow-y-auto space-y-1.5 leading-relaxed">
          {filteredLines.map((line, idx) => {
            const isWarn = line.includes('[WARN]');
            const isErr = line.includes('[ERROR]') || line.includes('Error');
            return (
              <div
                key={idx}
                className={`py-0.5 ${
                  isErr ? 'text-rose-400 font-semibold' : isWarn ? 'text-amber-300' : 'text-slate-300'
                }`}
              >
                {line}
              </div>
            );
          })}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
}
