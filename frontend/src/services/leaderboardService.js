import apiClient from './apiClient';

export const leaderboardService = {
  async getLeaderboard(params = {}) {
    const { category = 'GLOBAL', division = 'ALL', search = '', page = 0, size = 15 } = params;
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
    const response = await apiClient.get(
      `/leaderboard?category=${category}&division=${encodeURIComponent(division)}${searchParam}&page=${page}&size=${size}`
    );
    return response.data?.data;
  },

  async getPodium() {
    const response = await apiClient.get('/leaderboard/podium');
    return response.data?.data;
  },

  async getMyEntry() {
    const response = await apiClient.get('/leaderboard/me');
    return response.data?.data;
  },
};
