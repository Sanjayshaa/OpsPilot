import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Containers from './pages/Containers';
import Deploy from './pages/Deploy';
import Monitoring from './pages/Monitoring';
import Logs from './pages/Logs';
import Resources from './pages/Resources';
import Settings from './pages/Settings';
import { fetchDashboard } from './api';

export default function App() {
  const [isMockMode, setIsMockMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkStatus = async () => {
    try {
      setIsRefreshing(true);
      const dash = await fetchDashboard();
      setIsMockMode(!!dash.is_mock);
    } catch (err) {
      console.error('Error fetching dashboard status', err);
      setIsMockMode(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-dark-900 text-slate-100">
        {/* Left Sidebar */}
        <Sidebar isMockMode={isMockMode} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar title="OpsPilot Dashboard" onRefresh={checkStatus} isRefreshing={isRefreshing} />

          <main className="p-6 flex-1 max-w-7xl w-full mx-auto space-y-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/containers" element={<Containers />} />
              <Route path="/deploy" element={<Deploy />} />
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
