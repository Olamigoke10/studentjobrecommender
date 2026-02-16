import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api/auth.api';
import { TokenService } from '../utils/token';
import axios from 'axios';
import axiosInstance from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const loadUser = async () => {
    const token = TokenService.getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error("Failed to load user:", error);

      if (error.response?.status === 401) {
        TokenService.removeTokens();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  loadUser();
}, []);



const login = async (email, password) => {
  setError(null);

  try {
    const response = await authAPI.login(email, password);

    console.log("LOGIN RESPONSE:", response.data);

    const access = response.data.access;
    const refresh = response.data.refresh;

    // ✅ Save tokens
    TokenService.setTokens(access, refresh);

    // ✅ VERY IMPORTANT — set token on axiosInstance (NOT axios)
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${access}`;

    console.log("SAVED access_token:", localStorage.getItem("access_token"));
    console.log("SAVED refresh_token:", localStorage.getItem("refresh_token"));

    // ✅ Now this will succeed
    const userResponse = await authAPI.getProfile();
    setUser(userResponse.data);

    return { success: true };

  } catch (error) {
    console.error("Login error:", error);
    const message =
      error.response?.data?.detail || "Invalid email or password";
    setError(message);
    return { success: false, message };
  }
};



  const register = async (userData) => {
    setError(null);
    try {
      await authAPI.register(userData);

      // Auto login after registration
      const loginResult = await login(userData.email, userData.password);
      return loginResult;
    } catch (error) {
      console.error('Register error:', error);

      // ===============================
      // DEBUG LOGS (IMPORTANT)
      // ===============================
      console.log("REGISTER STATUS:", error.response?.status);
      console.log("REGISTER DATA:", error.response?.data);

      // Handle Django validation errors generically
      let message = 'Registration failed';
      const data = error.response?.data;

      if (data) {
        const firstKey = Object.keys(data)[0];
        const firstVal = data[firstKey];

        if (Array.isArray(firstVal)) message = firstVal[0];
        else if (typeof firstVal === "string") message = firstVal;
        else if (data.detail) message = data.detail;
      }

      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    TokenService.removeTokens();
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: TokenService.isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
