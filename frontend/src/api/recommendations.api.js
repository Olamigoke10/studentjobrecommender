import axiosInstance from './axios';

export const recommendationsAPI = {
  // Get recommended jobs for current user
  getRecommendations: () => 
    axiosInstance.get('/api/recommendations/'),
};
