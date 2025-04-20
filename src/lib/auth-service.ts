// src/lib/auth-service.ts
import axios from "axios";

// Base URL from environment variable, with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
    const tokens = JSON.parse(localStorage.getItem("authTokens") || sessionStorage.getItem("authTokens") || "{}");
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

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = JSON.parse(localStorage.getItem("authTokens") || sessionStorage.getItem("authTokens") || "{}");
        const refreshToken = tokens.refreshToken;
        if (!refreshToken) throw new Error("No refresh token available");

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;

        // Store new tokens in the same storage as the original
        const storage = localStorage.getItem("authTokens") ? localStorage : sessionStorage;
        const newTokens = { accessToken: access_token, refreshToken: refresh_token };
        storage.setItem("authTokens", JSON.stringify(newTokens));

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem("authTokens");
        sessionStorage.removeItem("authTokens");
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
        name,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * Login a user
   */
  login: async (email: string, password: string, rememberMe: boolean) => {
    try {
      // API expects username/password format for OAuth2 compatibility
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);
      formData.append("grant_type", "password");
      formData.append("scope", "");
      formData.append("client_id", "string");
      formData.append("client_secret", "string");

      // Temporarily override Content-Type for this request
      const response = await axiosInstance.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // Store tokens in localStorage or sessionStorage based on rememberMe
      const storage = rememberMe ? localStorage : sessionStorage;
      const authTokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
      };
      storage.setItem("authTokens", JSON.stringify(authTokens));

      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * Logout the current user
   */
  logout: async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await axiosInstance.post("/auth/logout");
    } catch (error: any) {
      console.error("Logout error:", error);
      throw error.response?.data || error;
    } finally {
      // Remove tokens from storage
      localStorage.removeItem("authTokens");
      sessionStorage.removeItem("authTokens");
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!(localStorage.getItem("authTokens") || sessionStorage.getItem("authTokens"));
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get("/users/me");
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string) => {
    try {
      const response = await axiosInstance.post("/auth/send-reset-password", { email });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
};

export default AuthService;
export { axiosInstance };