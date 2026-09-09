import apiClient from './apiClient';

export const matchService = {
  async createMatch(matchData) {
    const response = await apiClient.post('/matches', matchData);
    return response.data?.data;
  },

  async recordResult(matchId, resultData) {
    const response = await apiClient.post(`/matches/${matchId}/result`, resultData);
    return response.data?.data;
  },

  async recordQuickResult(resultData) {
    const response = await apiClient.post('/matches/quick-result', resultData);
    return response.data?.data;
  },

  async getRecentMatches(limit = 5) {
    const response = await apiClient.get(`/matches/recent?limit=${limit}`);
    return response.data?.data;
  },

  async getLastEncounter() {
    const response = await apiClient.get('/matches/last-encounter');
    return response.data?.data;
  },

  async getMatchHistory(page = 0, size = 10) {
    const response = await apiClient.get(`/matches/history?page=${page}&size=${size}`);
    return response.data?.data;
  },
};
