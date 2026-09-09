import apiClient from './apiClient';

export const userService = {
  async getProfile() {
    const response = await apiClient.get('/users/profile');
    return response.data?.data;
  },

  async getUserById(id) {
    const response = await apiClient.get(`/users/${id}`);
    return response.data?.data;
  },

  async updateProfile(data) {
    const response = await apiClient.put('/users/profile', data);
    return response.data?.data;
  },
};
