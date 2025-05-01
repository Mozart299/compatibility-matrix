// src/contexts/auth-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthService, { isBrowser } from "@/lib/auth-service";

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  [key: string]: any; 
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const clearError = () => setError(null);

  useEffect(() => {
    // Skip if not in browser
    if (!isBrowser()) {
      setIsLoading(false);
      return;
    }
    
    const checkAuth = async () => {
      try {
        if (AuthService.isAuthenticated()) {
          console.log("Auth check: User is authenticated, fetching user data");
          const userData = await AuthService.getCurrentUser();
          setUser(userData);
          console.log("User data fetched successfully");
        } else {
          console.log("Auth check: User is not authenticated");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        await AuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    setIsLoading(true);
    clearError();
    try {
      await AuthService.login(email, password, rememberMe);
      const userData = await AuthService.getCurrentUser();
      setUser(userData);
    } catch (err: any) {
      setError(err.detail || "Login failed. Please check your credentials.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    clearError();
    try {
      await AuthService.register(email, password, name);
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.detail || "Registration failed. Please try again.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      router.push("/login");
    } catch (err: any) {
      setError(err.detail || "Logout failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};