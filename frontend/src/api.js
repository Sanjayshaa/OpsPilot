import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const handleRes = (res) => {
  if (res.data && res.data.success !== undefined) {
    if (res.data.success) {
      return res.data.data;
    } else {
      throw new Error(res.data.error || 'API Request failed');
    }
  }
  return res.data;
};

// Workload & Engine APIs
export const fetchDashboard = (envId) => api.get('/dashboard', { params: { environment_id: envId } }).then(handleRes);
export const fetchContainers = (envId) => api.get('/containers', { params: { environment_id: envId } }).then(handleRes);
export const inspectContainer = (containerId, envId) => api.get(`/container/${containerId}/inspect`, { params: { environment_id: envId } }).then(handleRes);
export const deployContainer = (payload) => api.post('/deploy', payload).then(handleRes);
export const startContainer = (containerId, envId) => api.post('/container/start', { container_id: containerId, environment_id: envId }).then(handleRes);
export const stopContainer = (containerId, envId) => api.post('/container/stop', { container_id: containerId, environment_id: envId }).then(handleRes);
export const restartContainer = (containerId, envId) => api.post('/container/restart', { container_id: containerId, environment_id: envId }).then(handleRes);
export const deleteContainer = (containerId, envId) => api.delete(`/container/${containerId}`, { params: { environment_id: envId } }).then(handleRes);
export const fetchLogs = (containerId, tail = 200, envId) => api.get(`/logs/${containerId}?tail=${tail}`, { params: { environment_id: envId } }).then(handleRes);
export const fetchStats = (containerId, envId) => api.get(`/stats/${containerId}`, { params: { environment_id: envId } }).then(handleRes);
export const fetchResources = (envId) => api.get('/resources', { params: { environment_id: envId } }).then(handleRes);
export const runCleanup = (envId) => api.post('/cleanup', null, { params: { environment_id: envId } }).then(handleRes);
export const fetchProviders = () => api.get('/providers').then(handleRes);

// Projects & Environments APIs
export const fetchProjects = () => api.get('/projects').then(handleRes);
export const createProject = (payload) => api.post('/projects', payload).then(handleRes);
export const getProject = (projectId) => api.get(`/projects/${projectId}`).then(handleRes);
export const deleteProject = (projectId) => api.delete(`/projects/${projectId}`).then(handleRes);
export const fetchProjectEnvironments = (projectId) => api.get(`/projects/${projectId}/environments`).then(handleRes);
export const createEnvironment = (projectId, payload) => api.post(`/projects/${projectId}/environments`, payload).then(handleRes);
export const deleteEnvironment = (envId) => api.delete(`/environments/${envId}`).then(handleRes);

export default api;
