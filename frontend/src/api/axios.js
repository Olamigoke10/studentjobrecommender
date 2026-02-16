import axios from "axios";
import { TokenService } from "../utils/token";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://studentjobrecommender.onrender.com";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ✅ Add token to every request (except login/register/refresh)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = TokenService.getAccessToken();

    // Avoid attaching token to auth endpoints
    const url = config.url || "";
    const isAuthEndpoint =
      url.includes("/api/users/login/") ||
      url.includes("/api/users/register/") ||
      url.includes("/api/users/token/refresh/");

    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle refresh only when refresh token exists AND endpoint isn't auth
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || "";

    const isAuthEndpoint =
      url.includes("/api/users/login/") ||
      url.includes("/api/users/register/") ||
      url.includes("/api/users/token/refresh/");

    // If 401 from auth endpoints, don't try refresh — just fail normally
    if (error.response?.status === 401 && isAuthEndpoint) {
      return Promise.reject(error);
    }

    // Try refresh once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = TokenService.getRefreshToken();

      // No refresh token? logout safely
      if (!refreshToken) {
        TokenService.removeTokens();
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/users/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = refreshResponse.data;
        TokenService.setTokens(access, refreshToken);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        TokenService.removeTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
