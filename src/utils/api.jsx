import axios from 'axios';

export const BASE_URL = localStorage.getItem('backend_url') || 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
