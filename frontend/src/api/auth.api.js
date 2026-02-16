import axiosInstance from './axios';

export const authAPI = {
  login: (email, password) => 
    axiosInstance.post('/api/users/login/', { email, password }),
  
  register: (userData) => 
    axiosInstance.post('/api/users/register/', userData),
  
  refreshToken: (refresh) => 
    axiosInstance.post('/api/users/token/refresh/', { refresh }),
  
  getProfile: () => 
    axiosInstance.get('/api/users/me/'),
  
  updateProfile: (profileData) => 
    axiosInstance.patch('/api/users/me/', profileData),
  
  getSkills: () => 
    axiosInstance.get('/api/users/skills/'),
};