import apiClient from './apiClient';

export const questService = {
  async getTacticalQuests() {
    try {
      const response = await apiClient.get('/quests');
      return response.data?.data || [];
    } catch (e) {
      const response = await apiClient.get('/quests/public');
      return response.data?.data || [];
    }
  },
};
