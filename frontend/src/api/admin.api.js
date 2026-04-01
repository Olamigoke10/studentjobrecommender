import axiosInstance from './axios';

export const adminAPI = {
  getStats: () => axiosInstance.get('/api/users/admin/stats/'),

  getSkills: () => axiosInstance.get('/api/users/admin/skills/'),

  createSkill: (name) =>
    axiosInstance.post('/api/users/admin/skills/', { name: name.trim() }),

  updateSkill: (id, name) =>
    axiosInstance.patch(`/api/users/admin/skills/${id}/`, { name: name.trim() }),

  deleteSkill: (id) => axiosInstance.delete(`/api/users/admin/skills/${id}/`),
};
