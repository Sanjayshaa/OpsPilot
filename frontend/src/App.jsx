import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Containers from './pages/Containers';
import Deploy from './pages/Deploy';
import Monitoring from './pages/Monitoring';
import Logs from './pages/Logs';
import Resources from './pages/Resources';
import Settings from './pages/Settings';
import { fetchDashboard, fetchProjects } from './api';

export default function App() {
  const [isMockMode, setIsMockMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeEnv, setActiveEnv] = useState('env_default_dev');
  const [activeProjectName, setActiveProjectName] = useState('Default Workspace');
  const [activeEnvName, setActiveEnvName] = useState('Local Docker Development');
  const [activeProvider, setActiveProvider] = useState('docker');

  const checkStatus = async () => {
    try {
      setIsRefreshing(true);
      const [dash, projects] = await Promise.all([
        fetchDashboard(activeEnv),
        fetchProjects().catch(() => [])
      ]);

      setIsMockMode(!!dash.is_mock);
      if (dash.environment) {
        setActiveEnvName(dash.environment.name || 'Local Docker Development');
        setActiveProvider(dash.environment.provider_type || 'docker');
      }

      if (Array.isArray(projects) && projects.length > 0) {
        const foundProj = projects.find(p => p.environments?.some(e => e.id === activeEnv)) || projects[0];
        if (foundProj) {
          setActiveProjectName(foundProj.name);
          const foundEnv = foundProj.environments?.find(e => e.id === activeEnv);
          if (foundEnv) {
            setActiveEnvName(foundEnv.name);
            setActiveProvider(foundEnv.provider_type);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard status', err);
      setIsMockMode(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [activeEnv]);

  const handleSelectEnv = (envId) => {
    setActiveEnv(envId);
  };

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-dark-900 text-slate-100">
        {/* Left Sidebar */}
        <Sidebar 
          isMockMode={isMockMode} 
          activeEnv={activeEnv}
          activeProjectName={activeProjectName}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar 
            title="OpsPilot Platform" 
            onRefresh={checkStatus} 
            isRefreshing={isRefreshing}
            activeProjectName={activeProjectName}
            activeEnvName={activeEnvName}
            activeProvider={activeProvider}
          />

          <main className="p-6 flex-1 max-w-7xl w-full mx-auto space-y-6">
            <Routes>
              <Route path="/" element={<Dashboard activeEnv={activeEnv} />} />
              <Route 
                path="/projects" 
                element={<Projects activeEnv={activeEnv} onSelectEnv={handleSelectEnv} />} 
              />
              <Route path="/containers" element={<Containers activeEnv={activeEnv} />} />
              <Route path="/deploy" element={<Deploy activeEnv={activeEnv} />} />
              <Route path="/monitoring" element={<Monitoring activeEnv={activeEnv} />} />
              <Route path="/logs" element={<Logs activeEnv={activeEnv} />} />
              <Route path="/resources" element={<Resources activeEnv={activeEnv} />} />
              <Route path="/settings" element={<Settings activeEnv={activeEnv} />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
