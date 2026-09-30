import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Copy, Check, Info, Server } from 'lucide-react';

export default function Settings() {
  const [copied, setCopied] = useState(false);

  const resumeText = `OpsPilot – Docker Deployment & Monitoring Platform: Developed a lightweight Docker operations platform using FastAPI, React, and Docker SDK. The platform provides centralized container deployment, lifecycle management, resource monitoring, log viewing, and Docker resource cleanup through an intuitive web dashboard.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(resumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-devops-cyan" /> OpsPilot Platform Settings
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            System configuration, Docker API socket parameters, and project resume description.
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Docker Connection Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Server className="w-4 h-4 text-devops-blue" /> Docker Socket Configuration
          </h4>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Unix Socket Path</span>
              <span className="text-devops-cyan font-bold">/var/run/docker.sock</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">API Telemetry Refresh Rate</span>
              <span className="text-devops-emerald font-bold">5000 ms (5 sec)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Log Tail Buffering</span>
              <span className="text-slate-300 font-bold">300 lines</span>
            </div>
          </div>
        </div>

        {/* Resume Description Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-devops-cyan" /> Portfolio Resume Description
            </h4>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-devops-emerald" />
                  <span className="text-devops-emerald">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
            {resumeText}
          </div>
        </div>
      </div>
    </div>
  );
}
