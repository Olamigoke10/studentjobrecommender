import axiosInstance from './axios';

export const adminAPI = {
  getStats: () => axiosInstance.get('/api/users/admin/stats/'),

  getSkills: () => axiosInstance.get('/api/users/admin/skills/'),
  getSkillFields: () => axiosInstance.get('/api/users/admin/skill-fields/'),

  createSkill: (name, fieldIds = []) =>
    axiosInstance.post('/api/users/admin/skills/', { name: name.trim(), field_ids: fieldIds }),

  updateSkill: (id, name, fieldIds) =>
    axiosInstance.patch(`/api/users/admin/skills/${id}/`, {
      name: name.trim(),
      ...(fieldIds !== undefined ? { field_ids: fieldIds } : {}),
    }),

  deleteSkill: (id) => axiosInstance.delete(`/api/users/admin/skills/${id}/`),
};
