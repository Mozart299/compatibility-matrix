// src/lib/auth-service.ts
import axios from 'axios';

// Base URL from environment variable, with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// Configure axios with defaults
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include auth token in requests
axiosInstance.interceptors.request.use(
  (config) => {
    let tokens;
    try {
      tokens = JSON.parse(localStorage.getItem('authTokens') || sessionStorage.getItem('authTokens') || '{}');
    } catch (e) {
      tokens = {};
    }
    const token = tokens.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        let tokens;
        try {
          tokens = JSON.parse(localStorage.getItem('authTokens') || sessionStorage.getItem('authTokens') || '{}');
        } catch (e) {
          tokens = {};
        }
        const refreshToken = tokens.refreshToken;
        if (!refreshToken) throw new Error('No refresh token available');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        const { access_token, refresh_token } = response.data;
        const storage = localStorage.getItem('authTokens') ? localStorage : sessionStorage;
        const newTokens = { accessToken: access_token, refreshToken: refresh_token };
        storage.setItem('authTokens', JSON.stringify(newTokens));
        document.cookie = `accessToken=${access_token}; path=/; secure; samesite=strict`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('authTokens');
        sessionStorage.removeItem('authTokens');
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Auth service API
const AuthService = {
  register: async (email: string, password: string, name: string) => {
    try {
      const response = await axiosInstance.post('/auth/register', {
        email,
        password,
        name,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  login: async (email: string, password: string, rememberMe: boolean) => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      formData.append('grant_type', 'password');
      formData.append('scope', '');
      formData.append('client_id', 'string');
      formData.append('client_secret', 'string');
      const response = await axiosInstance.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const storage = rememberMe ? localStorage : sessionStorage;
      const authTokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
      };
      storage.setItem('authTokens', JSON.stringify(authTokens));
      document.cookie = `accessToken=${response.data.access_token}; path=/; secure; samesite=strict`;
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  getGoogleAuthUrl: async () => {
    try {
      const response = await axiosInstance.get('/auth/login/google');
      return response.data;
    } catch (error: any) {
      console.error('Failed to get Google auth URL:', error);
      throw error.response?.data || error;
    }
  },

  handleGoogleCallback: async (code: string) => {
    try {
      if (!code) {
        throw new Error('No authentication code provided');
      }
      // Call the Next.js API route with a GET request
      const response = await fetch(`/api/auth/callback/google?code=${encodeURIComponent(code)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      // Token storage is handled by the API route, but you can add it here if needed
      return data;
    } catch (error: any) {
      console.error('Google callback error:', error);
     throw error.response?.data || error;
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error: any) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authTokens');
      sessionStorage.removeItem('authTokens');
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    }
  },

  isAuthenticated: () => {
    try {
      const authTokensStr = localStorage.getItem('authTokens') || sessionStorage.getItem('authTokens');
      if (!authTokensStr) return false;
      const authTokens = JSON.parse(authTokensStr);
      return !!authTokens.accessToken;
    } catch (e) {
      return false;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get('/users/me');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  requestPasswordReset: async (email: string) => {
    try {
      const response = await axiosInstance.post('/auth/send-reset-password', { email });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
};

export default AuthService;
export { axiosInstance };