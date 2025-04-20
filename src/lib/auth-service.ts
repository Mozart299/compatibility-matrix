// src/lib/auth-service.ts
import axios from "axios";

// Base URL from environment variable, with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Configure axios with defaults
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to include auth token in requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
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
    
    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");
        
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken
        });
        
        const { access_token, refresh_token } = response.data;
        
        // Store new tokens
        localStorage.setItem("accessToken", access_token);
        localStorage.setItem("refreshToken", refresh_token);
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth service API
const AuthService = {
  /**
   * Register a new user
   */
  register: async (email: string, password: string, name: string) => {
    try {
      const response = await axiosInstance.post("/auth/register", {
        email,
        password,
        name
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Login a user
   */
  login: async (email: string, password: string) => {
    try {
      // API expects username/password format for OAuth2 compatibility
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);
      
      const response = await axiosInstance.post("/auth/login", formData);
      
      // Store tokens in localStorage
      localStorage.setItem("accessToken", response.data.access_token);
      localStorage.setItem("refreshToken", response.data.refresh_token);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Logout the current user
   */
  logout: async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Remove tokens from localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("accessToken");
  },
  
  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get("/users/me");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string) => {
    try {
      const response = await axiosInstance.post("/auth/send-reset-password", { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default AuthService;
export { axiosInstance };