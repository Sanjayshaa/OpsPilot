import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, 
  Layers, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Server, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Cpu,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { 
  fetchProjects, 
  createProject, 
  deleteProject, 
  createEnvironment, 
  deleteEnvironment 
} from '../api';

export default function Projects({ activeEnv, onSelectEnv }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // New Project Modal State
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [submittingProject, setSubmittingProject] = useState(false);

  // New Environment Modal State
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState(null);
  const [newEnvName, setNewEnvName] = useState('');
  const [newEnvType, setNewEnvType] = useState('development');
  const [newEnvProvider, setNewEnvProvider] = useState('docker');
  const [submittingEnv, setSubmittingEnv] = useState(false);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      setSubmittingProject(true);
      setError(null);
      await createProject({
        name: newProjectName.trim(),
        description: newProjectDesc.trim()
      });
      setSuccessMsg(`Project "${newProjectName}" created successfully!`);
      setShowProjectModal(false);
      setNewProjectName('');
      setNewProjectDesc('');
      await loadProjects();
    } catch (err) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setSubmittingProject(false);
    }
  };

  const handleDeleteProject = async (projectId, isDefault) => {
    if (isDefault) {
      setError("Cannot delete the default project workspace.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this project and its environments?")) {
      return;
    }
    try {
      setError(null);
      await deleteProject(projectId);
      setSuccessMsg("Project deleted successfully.");
      await loadProjects();
    } catch (err) {
      setError(err.message || 'Failed to delete project.');
    }
  };

  const handleCreateEnv = async (e) => {
    e.preventDefault();
    if (!newEnvName.trim() || !targetProjectId) return;
    try {
      setSubmittingEnv(true);
      setError(null);
      await createEnvironment(targetProjectId, {
        name: newEnvName.trim(),
        env_type: newEnvType,
        provider_type: newEnvProvider
      });
      setSuccessMsg(`Environment "${newEnvName}" created!`);
      setShowEnvModal(false);
      setNewEnvName('');
      await loadProjects();
    } catch (err) {
      setError(err.message || 'Failed to create environment.');
    } finally {
      setSubmittingEnv(false);
    }
  };

  const handleDeleteEnv = async (envId, isDefault) => {
    if (isDefault) {
      setError("Cannot delete protected default environment.");
      return;
    }
    if (!window.confirm("Are you sure you want to remove this environment?")) {
      return;
    }
    try {
      setError(null);
      await deleteEnvironment(envId);
      setSuccessMsg("Environment removed.");
      await loadProjects();
    } catch (err) {
      setError(err.message || 'Failed to delete environment.');
    }
  };

  const totalEnvs = projects.reduce((acc, p) => acc + (p.environments?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Title & Vision Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-devops-blue to-devops-cyan text-white shadow-neon-blue">
            <FolderGit2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">Projects & Environments</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-devops-cyan/20 text-devops-cyan border border-devops-cyan/30">
                Phase 14 Foundation
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Multi-tenant architecture boundaries, isolation scopes, and pluggable infrastructure providers.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowProjectModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-devops-blue to-devops-cyan text-white font-semibold text-xs shadow-neon-cyan hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white font-mono">×</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white font-mono">×</button>
        </div>
      )}

      {/* Platform Architecture Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400">Total Projects</p>
            <p className="text-2xl font-bold text-white mt-1">{projects.length}</p>
          </div>
          <FolderGit2 className="w-6 h-6 text-devops-cyan opacity-80" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400">Active Environments</p>
            <p className="text-2xl font-bold text-devops-emerald mt-1">{totalEnvs}</p>
          </div>
          <Layers className="w-6 h-6 text-devops-emerald opacity-80" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400">Default Provider</p>
            <p className="text-sm font-bold text-devops-cyan mt-1 flex items-center gap-1.5">
              <Server className="w-4 h-4" /> Docker Engine
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-devops-cyan/10 text-devops-cyan border border-devops-cyan/30">
            Active
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400">Persistence Store</p>
            <p className="text-sm font-bold text-slate-200 mt-1 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-devops-blue" /> SQLite DB
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            ACID
          </span>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm font-mono">
            Loading project environments...
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center text-slate-400">
            No projects registered yet.
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
              {/* Project Top Bar */}
              <div className="p-5 border-b border-slate-800/80 bg-slate-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4 text-devops-cyan" />
                      {project.name}
                    </h3>
                    {project.is_default && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Default Workspace (Protected)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {project.description || 'No description provided.'}
                    <span className="text-slate-500 font-mono ml-2">ID: {project.id}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTargetProjectId(project.id);
                      setShowEnvModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 hover:border-devops-cyan/50 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-devops-cyan" />
                    <span>Add Environment</span>
                  </button>

                  {!project.is_default && (
                    <button
                      onClick={() => handleDeleteProject(project.id, project.is_default)}
                      className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 transition-all cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Environments Inside Project */}
              <div className="p-5">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-devops-cyan" />
                  Configured Environments ({project.environments?.length || 0})
                </h4>

                {(!project.environments || project.environments.length === 0) ? (
                  <p className="text-xs text-slate-500 italic py-2">No environments configured for this project.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {project.environments.map((env) => {
                      const isSelected = activeEnv === env.id;
                      return (
                        <div 
                          key={env.id}
                          className={`p-4 rounded-xl border transition-all duration-200 ${
                            isSelected 
                              ? 'bg-devops-cyan/10 border-devops-cyan/50 shadow-neon-cyan' 
                              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="space-y-0.5">
                              <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                                {env.name}
                                {env.is_default && (
                                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-devops-blue/20 text-devops-blue border border-devops-blue/30 font-bold">
                                    Default
                                  </span>
                                )}
                              </h5>
                              <p className="text-[11px] font-mono text-slate-500">{env.id}</p>
                            </div>

                            {!env.is_default && (
                              <button
                                onClick={() => handleDeleteEnv(env.id, env.is_default)}
                                className="text-slate-500 hover:text-rose-400 p-1 transition-all"
                                title="Delete Environment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800/60 text-xs">
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {env.env_type}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-devops-cyan/10 text-devops-cyan border border-devops-cyan/30 flex items-center gap-1">
                              <Server className="w-2.5 h-2.5" /> {env.provider_type}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 ml-auto">
                              <CheckCircle2 className="w-2.5 h-2.5" /> {env.status}
                            </span>
                          </div>

                          {onSelectEnv && (
                            <button
                              onClick={() => onSelectEnv(env.id)}
                              className={`mt-3 w-full py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'bg-devops-cyan text-dark-900 font-bold shadow-sm'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              {isSelected ? '✓ Active Environment' : 'Switch to this Env'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Project */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-devops-cyan" />
                Create New Project
              </h3>
              <button onClick={() => setShowProjectModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Payment Platform, Analytics Service"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-devops-cyan"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Scope, microservices, and operational notes..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-devops-cyan"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProject}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-devops-blue to-devops-cyan text-white font-bold"
                >
                  {submittingProject ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Environment */}
      {showEnvModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-devops-cyan" />
                Add Environment
              </h3>
              <button onClick={() => setShowEnvModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateEnv} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Environment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staging, Production-EU, QA-Test"
                  value={newEnvName}
                  onChange={(e) => setNewEnvName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-devops-cyan"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Environment Type</label>
                <select
                  value={newEnvType}
                  onChange={(e) => setNewEnvType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-devops-cyan"
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Infrastructure Provider</label>
                <select
                  value={newEnvProvider}
                  onChange={(e) => setNewEnvProvider(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-devops-cyan"
                >
                  <option value="docker">Docker Engine (Active Provider)</option>
                  <option value="kubernetes" disabled>Kubernetes (Planned Phase 26)</option>
                  <option value="terraform" disabled>Terraform / Cloud (Planned Phase 27)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEnvModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEnv}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-devops-blue to-devops-cyan text-white font-bold"
                >
                  {submittingEnv ? 'Creating...' : 'Create Environment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
