import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const wordApi = {
  getAllWords: (params = {}) => api.get('/words', { params }),
  getWordStats: () => api.get('/words/stats'),
  searchWords: (term) => api.get('/words/search', { params: { q: term } }),
  getWordsByGender: (gender) => api.get('/words', { params: { gender } }),
  createWord: (data) => api.post('/words', data),
  updateWord: (id, data) => api.put(`/words/${id}`, data),
  deleteWord: (id) => api.delete(`/words/${id}`),
};

export const translateWord = (word) => api.post('/translate', { word });

export default api;
