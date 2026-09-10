import apiClient from './apiClient';

export const authService = {
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data?.data;
  },

  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data?.data;
  },

  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data?.data;
  },

  async resetPassword(data) {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data?.data;
  },

  async deleteUser(username) {
    const response = await apiClient.delete(`/auth/user/${encodeURIComponent(username)}`);
    return response.data;
  },
};

