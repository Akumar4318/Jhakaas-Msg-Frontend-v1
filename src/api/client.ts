import axios from 'axios';

// Environment-aware backend API URL:
// - In local development (npm run dev): defaults to http://localhost:3000 (from .env.development)
// - In production build (vite build): defaults to https://jhakaas-msgv1.onrender.com (from .env.production)
// - Overridden if VITE_API_URL is supplied in the environment
const DEFAULT_DEV_API = 'http://localhost:3000';
const DEFAULT_PROD_API = 'https://jhakaas-msgv1.onrender.com';

const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim();
  }
  return (import.meta as any).env?.PROD ? DEFAULT_PROD_API : DEFAULT_DEV_API;
};

const API_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor to unwrap data and handle 401
apiClient.interceptors.response.use(
  (response) => {
    // If response follows { success: true, data: ... } standard format, unwrap data
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if token expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  },
);
