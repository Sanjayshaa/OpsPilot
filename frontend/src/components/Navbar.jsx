import React from 'react';
import { RefreshCw, Search, FolderGit2, Layers, Server } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({ 
  title, 
  onRefresh, 
  isRefreshing, 
  activeProjectName = "Default Workspace",
  activeEnvName = "Local Docker Development",
  activeProvider = "docker"
}) {
  return (
    <header className="glass-panel border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-xs text-slate-400 font-mono">
          OpsPilot — Multi-Agent AI DevOps & Cloud Platform
        </p>
      </div>

      <div className="flex items-center space-x-3">
        {/* Project & Environment Context Badge */}
        <Link
          to="/projects"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-devops-cyan/50 text-xs transition-all group"
          title="Click to manage Projects and Environments"
        >
          <FolderGit2 className="w-3.5 h-3.5 text-devops-cyan group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-slate-200">{activeProjectName}</span>
          <span className="text-slate-600">/</span>
          <Layers className="w-3 h-3 text-devops-emerald" />
          <span className="text-slate-400 font-mono text-[11px]">{activeEnvName}</span>
          <span className="ml-1 text-[9px] uppercase px-1.5 py-0.2 rounded bg-devops-blue/20 text-devops-cyan border border-devops-blue/30 font-bold">
            {activeProvider}
          </span>
        </Link>

        {/* Search Input */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search containers, images..."
            className="pl-9 pr-4 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-devops-cyan focus:ring-1 focus:ring-devops-cyan transition-all w-52"
          />
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all hover:border-devops-cyan/50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-devops-cyan' : 'text-slate-400'}`} />
          <span>Refresh</span>
        </button>
      </div>
    </header>
  );
}
