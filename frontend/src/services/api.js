import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData)
};

export const publicAPI = {
  submitReport: (formData) => {
    return axios.post(`${API_BASE_URL}/public/report`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getReport: (reportId) => api.get(`/public/report/${reportId}`)
};

export const missingPersonsAPI = {
  create: (formData) => api.post('/missing-persons', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getAll: (status = 'active') => api.get('/missing-persons', { params: { status } }),
  getById: (id) => api.get(`/missing-persons/${id}`),
  updateStatus: (id, status) => api.put(`/missing-persons/${id}/status`, { status })
};

export const matchesAPI = {
  getAll: (params = {}) => api.get('/matches', { params }),
  getById: (id) => api.get(`/matches/${id}`),
  reviewMatch: (id, data) => api.put(`/matches/${id}/review`, data),
  getByCaseId: (caseId) => api.get(`/matches/case/${caseId}`),
  getStats: () => api.get('/matches/stats/dashboard')
};

export const videosAPI = {
  upload: (formData) => api.post('/videos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getAll: () => api.get('/videos'),
  getById: (id) => api.get(`/videos/${id}`),
  getMatches: (id) => api.get(`/videos/${id}/matches`)
};

export default api;
