import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('civicpulse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authAPI = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (data) => apiClient.post('/auth/register', data),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
};

export const riskAPI = {
  getCurrentRisk: (params) => apiClient.get('/risk/current', { params }),
  getAllLocationsRisk: () => apiClient.get('/risk/locations'),
  predict: (data) => apiClient.post('/risk/predict', data),
  simulate: (data) => apiClient.post('/risk/simulate', data),
};

export const alertsAPI = {
  getAlerts: (params) => apiClient.get('/alerts', { params }),
  getActiveAlerts: () => apiClient.get('/alerts/active'),
  createAlert: (data) => apiClient.post('/alerts', data),
  resolveAlert: (id) => apiClient.patch(`/alerts/${id}/resolve`),
};

export const reportsAPI = {
  getReports: (params) => apiClient.get('/reports', { params }),
  submitReport: (data) => apiClient.post('/reports', data),
  uploadPhoto: (formData) => apiClient.post('/reports/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  verifyReport: (id, data) => apiClient.patch(`/reports/${id}/verify`, data),
};

export const sheltersAPI = {
  getShelters: (params) => apiClient.get('/shelters', { params }),
  getEmergencyServices: (params) => apiClient.get('/shelters/emergency-services', { params }),
  createShelter: (data) => apiClient.post('/shelters', data),
  updateShelter: (id, occupancy, isOpen) => apiClient.patch(`/shelters/${id}`, null, {
    params: { occupancy, is_open: isOpen }
  }),
};

export const analyticsAPI = {
  getOverview: () => apiClient.get('/analytics/overview'),
  getMLMetrics: () => apiClient.get('/analytics/ml-metrics'),
  getHistoricalDisasters: (params) => apiClient.get('/analytics/historical', { params }),
  getTelemetry: () => apiClient.get('/analytics/telemetry'),
};

export const adminAPI = {
  getDashboard: () => apiClient.get('/admin/dashboard'),
  getAuditLogs: () => apiClient.get('/admin/audit-logs'),
  getExportUrl: () => `${API_BASE_URL}/admin/export-csv`,
};

export default apiClient;
