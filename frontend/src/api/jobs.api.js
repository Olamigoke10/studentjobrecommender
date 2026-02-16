import axiosInstance from './axios';

export const jobsAPI = {
  // Get all jobs
  getJobs: () =>
    axiosInstance.get('/api/jobs/'),

  // Fetch latest jobs from Adzuna and save to DB (for students to populate the list)
  refreshJobs: () =>
    axiosInstance.post('/api/jobs/refresh/', {}),

  // Get saved jobs for current user
  getSavedJobs: () =>
    axiosInstance.get('/api/jobs/saved/'),

  // Save a job
  saveJob: (jobId) =>
    axiosInstance.post(`/api/jobs/${jobId}/`),

  // Unsave a job
  unsaveJob: (jobId) =>
    axiosInstance.delete(`/api/jobs/${jobId}/`),
};
