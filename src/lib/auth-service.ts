// src/lib/auth-service.ts
import axios from 'axios';

// Base URL from environment variable, with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// Check if we're running on the client or server
const isClient = typeof window !== 'undefined';

// Configure axios with defaults
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to check if we're in a browser environment
const isBrowser = () => typeof window !== 'undefined';

// IMPORTANT: Add a function to initialize auth headers explicitly
const initializeAuthHeaders = () => {
  // Skip on server-side
  if (!isBrowser()) return false;
  
  // Check cookies first (they take precedence for SSR compatibility)
  const cookies = document.cookie.split(';');
  const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
  const googleAuthTokenCookie = cookies.find(cookie => cookie.trim().startsWith('googleAuthToken='));
  
  let token = null;
  
  // Get token from cookie if available
  if (accessTokenCookie) {
    token = accessTokenCookie.split('=')[1];
    console.log("Found accessToken in cookie, length:", token.length);
  } else if (googleAuthTokenCookie) {
    token = googleAuthTokenCookie.split('=')[1];
    console.log("Found googleAuthToken in cookie, length:", token.length);
  }
  
  // If no token in cookies, try localStorage/sessionStorage
  if (!token) {
    try {
      const authTokensStr = localStorage.getItem('authTokens') || sessionStorage.getItem('authTokens');
      if (authTokensStr) {
        const authTokens = JSON.parse(authTokensStr);
        token = authTokens.accessToken;
        console.log("Using token from storage, length:", token.length);
      }
    } catch (e) {
      console.error("Error parsing stored tokens:", e);
    }
  }
  
  // Apply token to axios instance if found
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log("Authorization header set explicitly");
    return true;
  }
  
  console.log("No auth token found to initialize");
  return false;
};

// Initialize auth headers immediately (but only on client-side)
if (isBrowser()) {
  initializeAuthHeaders();
}

// Add interceptor to include auth token in requests (as a backup)
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip if we're not in a browser
    if (!isBrowser()) return config;
    
    // Skip if Authorization is already set
    if (config.headers.Authorization) {
      return config;
    }
    
    // Check cookies first (for SSR compatibility)
    const cookies = document.cookie.split(';');
    const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
    const googleAuthTokenCookie = cookies.find(cookie => cookie.trim().startsWith('googleAuthToken='));
    
    if (accessTokenCookie) {
      const token = accessTokenCookie.split('=')[1];
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Added token from accessToken cookie to request");
      return config;
    }
    
    if (googleAuthTokenCookie) {
      const token = googleAuthTokenCookie.split('=')[1];
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Added token from googleAuthToken cookie to request");
      return config;
    }
    
    // Then check localStorage/sessionStorage
    try {
      const authTokensStr = localStorage.getItem('authTokens') || sessionStorage.getItem('authTokens');
      if (authTokensStr) {
        const authTokens = JSON.parse(authTokensStr);
        if (authTokens.accessToken) {
          config.headers.Authorization = `Bearer ${authTokens.accessToken}`;
          console.log("Added token from storage to request");
        }
      }
    } catch (e) {
      console.error("Error in auth interceptor:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Skip if we're not in a browser
    if (!isBrowser()) return Promise.reject(error);
    
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("Received 401, attempting token refresh");
      originalRequest._retry = true;
      try {
        let refreshToken = null;
        
        // Try to get refresh token from cookies first
        const cookies = document.cookie.split(';');
        const refreshTokenCookie = cookies.find(cookie => cookie.trim().startsWith('refreshToken='));
        if (refreshTokenCookie) {
          refreshToken = refreshTokenCookie.split('=')[1];
        }
        
        // If not in cookies, check storage
        if (!refreshToken) {
          try {
            const authTokensStr = localStorage.getItem('authTokens') || sessionStorage.getItem('authTokens');
            if (authTokensStr) {
              const authTokens = JSON.parse(authTokensStr);
              refreshToken = authTokens.refreshToken;
            }
          } catch (e) {
            console.error("Error getting refresh token from storage:", e);
          }
        }
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        console.log("Attempting to refresh token");
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        
        const { access_token, refresh_token } = response.data;
        console.log("Token refresh successful");
        
        // Update storage
        const storage = localStorage.getItem('authTokens') ? localStorage : sessionStorage;
        const newTokens = { accessToken: access_token, refreshToken: refresh_token || refreshToken };
        storage.setItem('authTokens', JSON.stringify(newTokens));
        
        // Update cookies
        document.cookie = `accessToken=${access_token}; path=/; secure; samesite=strict`;
        
        // Update axios headers for future requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
        console.log("Retrying original request with new token");
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        if (isBrowser()) {
          localStorage.removeItem('authTokens');
          sessionStorage.removeItem('authTokens');
          document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
          document.cookie = 'googleAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
          document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
          window.location.href = '/login';
        }
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
      
      if (isBrowser()) {
        const storage = rememberMe ? localStorage : sessionStorage;
        const authTokens = {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
        };
        storage.setItem('authTokens', JSON.stringify(authTokens));
        document.cookie = `accessToken=${response.data.access_token}; path=/; secure; samesite=strict`;
        
        // Immediately set the Authorization header for future requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      }
      
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  getGoogleAuthUrl: async (codeVerifier?: string) => {
    try {
      // If a code verifier is provided, include it in the request
      const params = codeVerifier ? { code_verifier: codeVerifier } : {};
      
      const response = await axiosInstance.get('/auth/login/google', { params });
      return response.data;
    } catch (error: any) {
      console.error('Failed to get Google auth URL:', error);
      throw error.response?.data || error;
    }
  },

  handleGoogleCallback: async (code: string, codeVerifier?: string) => {
    try {
      if (!code) {
        throw new Error('No authentication code provided');
      }
      
      // Create the request data
      const data: any = { code };
      if (codeVerifier) {
        data.code_verifier = codeVerifier;
      }
      
      // Call the Next.js API route
      const response = await fetch(`/api/auth/callback/google?code=${encodeURIComponent(code)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const responseData = await response.json();
      return responseData;
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
      if (isBrowser()) {
        localStorage.removeItem('authTokens');
        sessionStorage.removeItem('authTokens');
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
        document.cookie = 'googleAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
        document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
      }
    }
  },

  // Check if the user is authenticated by looking for tokens
  isAuthenticated: () => {
    if (!isBrowser()) return false;
    
    try {
      // First check for access token in cookies (for SSR)
      const cookies = document.cookie.split(';');
      const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
      const googleAuthTokenCookie = cookies.find(cookie => cookie.trim().startsWith('googleAuthToken='));
      
      if (accessTokenCookie || googleAuthTokenCookie) {
        return true;
      }
      
      // Then check localStorage/sessionStorage (for client-side)
      const authTokensStr = localStorage.getItem('authTokens') || sessionStorage.getItem('authTokens');
      if (!authTokensStr) return false;
      const authTokens = JSON.parse(authTokensStr);
      return !!authTokens.accessToken;
    } catch (e) {
      console.error("Error checking authentication:", e);
      return false;
    }
  },

  // Add a method to check and handle Google Auth tokens from cookies
  processGoogleAuthTokens: () => {
    if (!isBrowser()) return false;
    
    try {
      // Check for the Google auth tokens in cookies
      const cookies = document.cookie.split(';');
      const googleAuthTokenCookie = cookies.find(cookie => cookie.trim().startsWith('googleAuthToken='));
      
      if (googleAuthTokenCookie) {
        const googleAuthToken = googleAuthTokenCookie.split('=')[1];
        if (!googleAuthToken) {
          console.error('Google auth token cookie exists but has no value');
          return false;
        }
        
        console.log("Processing Google auth token, length:", googleAuthToken.length);
        
        // Also get the refresh token if available
        const refreshTokenCookie = cookies.find(cookie => cookie.trim().startsWith('refreshToken='));
        const refreshToken = refreshTokenCookie ? refreshTokenCookie.split('=')[1] : null;
        
        // Store tokens in localStorage
        const authTokens = {
          accessToken: googleAuthToken,
          refreshToken: refreshToken || '',
        };
        
        localStorage.setItem('authTokens', JSON.stringify(authTokens));
        console.log("Auth tokens stored in localStorage");
        
        // IMPORTANT: Set the authorization header for current axios instance
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${googleAuthToken}`;
        console.log("Authorization header set for current axios instance");
        
        // Set access token cookie to ensure it's available for middleware
        document.cookie = `accessToken=${googleAuthToken}; path=/; secure; samesite=strict; max-age=${60 * 60 * 24 * 7}`;
        console.log("Access token cookie set for 7 days");
        
        // Clear the Google auth token cookie after a delay to avoid issues
        setTimeout(() => {
          document.cookie = 'googleAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax';
          console.log("Google auth token cookie cleared after processing");
        }, 2000);
        
        return true;
      }
      
      return false;
    } catch (e) {
      console.error('Error processing Google auth tokens:', e);
      return false;
    }
  },

  getCurrentUser: async () => {
    try {
      // Initialize auth headers before making the API call (if in browser)
      if (isBrowser()) {
        initializeAuthHeaders();
      }
      
      const response = await axiosInstance.get('/users/me');
      return response.data;
    } catch (error: any) {
      console.error("Error getting current user:", error.response?.data || error);
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
export { axiosInstance, initializeAuthHeaders, isBrowser };