import axios from 'axios';
import { getStoredToken } from '../features/auth/storage';

const client = axios.create({
  baseURL: '/api',
});

client.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers || {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default client;
