import axiosInstance from './axios';

export const jobsAPI = {
  // Get jobs with optional search, filters, pagination. Returns { count, next, previous, results }.
  getJobs: (params = {}) =>
    axiosInstance.get('/api/jobs/', { params }),

  // Fetch latest jobs from Adzuna and save to DB (for students to populate the list)
  refreshJobs: (body = {}) =>
    axiosInstance.post('/api/jobs/refresh/', body),

  // Get saved jobs for current user
  getSavedJobs: () =>
    axiosInstance.get('/api/jobs/saved/'),

  // Save a job
  saveJob: (jobId) =>
    axiosInstance.post(`/api/jobs/${jobId}/`),

  // Unsave a job
  unsaveJob: (jobId) =>
    axiosInstance.delete(`/api/jobs/${jobId}/`),

  // Applications
  getApplications: () =>
    axiosInstance.get('/api/jobs/applications/'),

  createApplication: (jobId, data = {}) =>
    axiosInstance.post('/api/jobs/applications/', { job_id: jobId, ...data }),

  updateApplication: (applicationId, data) =>
    axiosInstance.patch(`/api/jobs/applications/${applicationId}/`, data),

  deleteApplication: (applicationId) =>
    axiosInstance.delete(`/api/jobs/applications/${applicationId}/`),
};
