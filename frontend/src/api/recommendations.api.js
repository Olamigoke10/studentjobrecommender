import axiosInstance from './axios';

export const recommendationsAPI = {
  getRecommendations: () => axiosInstance.get('/api/recommendations/'),

  /** Mark a job as not interested (excluded from future recommendations). */
  submitNotInterested: (jobId) =>
    axiosInstance.post('/api/recommendations/feedback/', { job_id: jobId }),
};
