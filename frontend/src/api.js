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

export const fetchDashboard = () => api.get('/dashboard').then(handleRes);
export const fetchContainers = () => api.get('/containers').then(handleRes);
export const inspectContainer = (containerId) => api.get(`/container/${containerId}/inspect`).then(handleRes);
export const deployContainer = (payload) => api.post('/deploy', payload).then(handleRes);
export const startContainer = (containerId) => api.post('/container/start', { container_id: containerId }).then(handleRes);
export const stopContainer = (containerId) => api.post('/container/stop', { container_id: containerId }).then(handleRes);
export const restartContainer = (containerId) => api.post('/container/restart', { container_id: containerId }).then(handleRes);
export const deleteContainer = (containerId) => api.delete(`/container/${containerId}`).then(handleRes);
export const fetchLogs = (containerId, tail = 200) => api.get(`/logs/${containerId}?tail=${tail}`).then(handleRes);
export const fetchStats = (containerId) => api.get(`/stats/${containerId}`).then(handleRes);
export const fetchResources = () => api.get('/resources').then(handleRes);
export const runCleanup = () => api.post('/cleanup').then(handleRes);

export default api;
