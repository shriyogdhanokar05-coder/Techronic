import axios from 'axios';
import { API_BASE_URL, TOKEN_STORAGE_KEY } from '../constants/config';
import { ROUTES } from '../constants/routes';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3500,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Redirect to /login on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired or invalid credentials
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      if (window.location.pathname !== ROUTES.LOGIN && window.location.pathname !== ROUTES.REGISTER) {
        window.location.href = ROUTES.LOGIN;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
