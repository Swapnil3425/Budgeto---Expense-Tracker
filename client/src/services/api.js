import axios from 'axios';
import { store } from '../store';

// In production, the backend serves the frontend from the same origin, 
// so '/api' works perfectly. In dev, we can override if needed.
const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || '/api' 
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      store.dispatch({ type: 'auth/logout' });
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
