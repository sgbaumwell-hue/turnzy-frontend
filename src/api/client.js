import axios from 'axios';

// In development, Vite proxies /api to localhost:3000
// In production on Railway, we need the full backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const client = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : `${BACKEND_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Add JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('turnzy_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('turnzy_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
