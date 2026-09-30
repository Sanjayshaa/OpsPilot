import React, { useState } from 'react';
import { deployContainer } from '../api';
import { Rocket, Layers, Plus, Trash2, CheckCircle, AlertCircle, Terminal, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Deploy() {
  const [image, setImage] = useState('');
  const [name, setName] = useState('');
  const [hostPort, setHostPort] = useState('');
  const [containerPort, setContainerPort] = useState('');
  const [restartPolicy, setRestartPolicy] = useState('unless-stopped');
  const [envKey, setEnvKey] = useState('');
  const [envValue, setEnvValue] = useState('');
  const [envVars, setEnvVars] = useState([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployOutput, setDeployOutput] = useState(null);

  const navigate = useNavigate();

  const presets = [
    { name: 'Nginx Web Server', image: 'nginx:alpine', defaultPort: '80:80', desc: 'High performance HTTP server' },
    { name: 'Redis Cache', image: 'redis:7-alpine', defaultPort: '6379:6379', desc: 'In-memory key-value data store' },
    { name: 'PostgreSQL DB', image: 'postgres:15-alpine', defaultPort: '5432:5432', desc: 'Relational database engine' },
    { name: 'MongoDB', image: 'mongo:6', defaultPort: '27017:27017', desc: 'NoSQL document store' },
    { name: 'Node.js App', image: 'node:18-slim', defaultPort: '3000:3000', desc: 'JavaScript runtime environment' },
    { name: 'Ubuntu Linux', image: 'ubuntu:22.04', defaultPort: '', desc: 'Base OS distribution' }
  ];

  const handleSelectPreset = (preset) => {
    setImage(preset.image);
    setName(preset.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-app');
    if (preset.defaultPort) {
      const [hp, cp] = preset.defaultPort.split(':');
      setHostPort(hp);
      setContainerPort(cp);
    } else {
      setHostPort('');
      setContainerPort('');
    }
  };

  const handleAddEnv = () => {
    if (envKey.trim() && envValue.trim()) {
      setEnvVars([...envVars, { key: envKey.trim(), value: envValue.trim() }]);
      setEnvKey('');
      setEnvValue('');
    }
  };

  const handleRemoveEnv = (index) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const handleDeploy = async (e) => {
    e.preventDefault();
    if (!image.trim()) return;

    try {
      setIsDeploying(true);
      setDeployOutput({ type: 'info', text: `Initiating image pull & container instantiation for ${image}...` });

      const portsPayload = (containerPort && hostPort) ? { [containerPort]: hostPort } : null;
      const envPayload = envVars.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});

      const payload = {
        image: image.trim(),
        name: name.trim() || undefined,
        ports: portsPayload,
        env: Object.keys(envPayload).length > 0 ? envPayload : undefined,
        restart_policy: restartPolicy
      };

      const res = await deployContainer(payload);
      setDeployOutput({
        type: 'success',
        text: res.message || `Container deployed successfully! ID: ${res.container_id}`
      });

      setTimeout(() => navigate('/containers'), 2200);

    } catch (err) {
      setDeployOutput({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to deploy container. Ensure image exists on registry.'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-devops-cyan" /> Container Deployment Wizard
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Instantiate any Docker Hub image or custom registry artifact into a running container workload.
          </p>
        </div>
      </div>

      {/* Quick Presets Selection */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Popular Workload Presets</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => handleSelectPreset(p)}
              className="glass-panel p-4 rounded-xl border border-slate-800 text-left hover:border-devops-cyan/50 hover:bg-slate-800/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-devops-cyan transition-colors">{p.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{p.image}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Deployment Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleDeploy} className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-2 space-y-5">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">Container Configuration</h4>

          {/* Image Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Docker Image Tag <span className="text-devops-rose">*</span></label>
            <input
              type="text"
              placeholder="e.g. nginx:latest, redis:7-alpine, myrepo/app:v1"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-mono text-slate-200 focus:outline-none focus:border-devops-cyan focus:ring-1 focus:ring-devops-cyan"
            />
          </div>

          {/* Container Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Container Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. web-gateway-prod"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-mono text-slate-200 focus:outline-none focus:border-devops-cyan focus:ring-1 focus:ring-devops-cyan"
            />
          </div>

          {/* Restart Policy & Ports */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Restart Policy</label>
              <select
                value={restartPolicy}
                onChange={(e) => setRestartPolicy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-mono text-slate-200 focus:outline-none focus:border-devops-cyan"
              >
                <option value="unless-stopped">unless-stopped</option>
                <option value="always">always</option>
                <option value="on-failure">on-failure</option>
                <option value="no">no</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Host Port</label>
              <input
                type="text"
                placeholder="e.g. 8080"
                value={hostPort}
                onChange={(e) => setHostPort(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-mono text-slate-200 focus:outline-none focus:border-devops-cyan"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Container Port</label>
              <input
                type="text"
                placeholder="e.g. 80"
                value={containerPort}
                onChange={(e) => setContainerPort(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-mono text-slate-200 focus:outline-none focus:border-devops-cyan"
              />
            </div>
          </div>

          {/* Environment Variables */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Environment Variables</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="KEY (e.g. PORT)"
                value={envKey}
                onChange={(e) => setEnvKey(e.target.value)}
                className="w-1/2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-mono text-slate-200"
              />
              <input
                type="text"
                placeholder="VALUE (e.g. 3000)"
                value={envValue}
                onChange={(e) => setEnvValue(e.target.value)}
                className="w-1/2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-mono text-slate-200"
              />
              <button
                type="button"
                onClick={handleAddEnv}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {envVars.length > 0 && (
              <div className="space-y-1 mt-2">
                {envVars.map((env, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/90 text-xs font-mono text-slate-300 border border-slate-800">
                    <span>{env.key}={env.value}</span>
                    <button type="button" onClick={() => handleRemoveEnv(i)} className="text-rose-400 hover:text-rose-300">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isDeploying || !image.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-devops-blue to-devops-cyan text-white font-bold text-sm shadow-neon-cyan hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isDeploying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Deploying Container Workload...</span>
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                <span>Launch Container Workload</span>
              </>
            )}
          </button>
        </form>

        {/* Deployment Output Console */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-devops-emerald" /> Deployment Stream Output
          </h4>

          <div className="terminal-window p-4 rounded-xl flex-grow font-mono text-xs text-slate-300 overflow-y-auto space-y-2 border border-slate-800 min-h-[220px]">
            {deployOutput ? (
              <div className={`flex items-start gap-2 ${deployOutput.type === 'success' ? 'text-emerald-400' : deployOutput.type === 'error' ? 'text-rose-400' : 'text-cyan-400'}`}>
                {deployOutput.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <p className="leading-relaxed">{deployOutput.text}</p>
              </div>
            ) : (
              <p className="text-slate-500 italic">Waiting for deployment execution...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
