import axios from 'axios';
import { store } from '@/store';
import { logOut } from '@/store/features/authSlice';

// Assuming backend is at localhost:8000 based on previous context
// Using 127.0.0.1 to avoid potential localhost IPv6 resolution issues
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

console.log("API Service Initialized with URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token; // Access token from Redux store

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error Interceptor:", {
      message: error.message,
      code: error.code,
      config: error.config,
      response: error.response
    });

    if (error.response && error.response.status === 401) {
      store.dispatch(logOut());
      if (typeof window !== 'undefined') {
          window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
