export const TokenService = {
  getAccessToken: () => localStorage.getItem('access_token'),
  
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  
  setTokens: (access, refresh) => {
    localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
  },
  
  removeTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  
  isAuthenticated: () => !!localStorage.getItem('access_token'),
};