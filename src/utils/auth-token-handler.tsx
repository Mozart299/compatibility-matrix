// src/utils/auth-token-handler.tsx
"use client";

import React, { useEffect } from 'react';
import { GoogleAuthHandler } from '@/components/auth/GoogleAuthHandler';
import AuthService, { initializeAuthHeaders, isBrowser } from '@/lib/auth-service';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function AuthTokenHandler() {
  const router = useRouter();
  
  useEffect(() => {
    // Skip if not in browser
    if (!isBrowser()) return;
    
    // Process any potential Google OAuth tokens immediately
    const processTokens = async () => {
      // Log auth state before processing
      console.log("Current auth state before processing:", {
        isAuthenticated: AuthService.isAuthenticated(),
        hasAuthTokens: !!localStorage.getItem('authTokens') || !!sessionStorage.getItem('authTokens'),
        hasCookies: document.cookie.includes('accessToken') || document.cookie.includes('googleAuthToken')
      });
      
      // Initialize auth headers - this directly applies any tokens to axios
      initializeAuthHeaders();
      
      // Pre-check for token
      let foundToken = false;
      const cookies = document.cookie.split(';');
      const googleAuthTokenCookie = cookies.find(cookie => cookie.trim().startsWith('googleAuthToken='));
      
      if (googleAuthTokenCookie) {
        console.log("Found googleAuthToken cookie, processing immediately...");
        foundToken = true;
      }
      
      // Process the token
      const tokenProcessed = AuthService.processGoogleAuthTokens();
      
      if (tokenProcessed) {
        console.log("Google auth tokens processed successfully");
        
        // Force a page reload after a small delay to ensure token is properly applied
        if (foundToken) {
          console.log("Will reload page to ensure token is applied correctly");
          setTimeout(() => {
            window.location.reload();
          }, 500);
          return;
        }
        
        // If we're already on the dashboard, don't redirect again
        const currentPath = window.location.pathname;
        if (currentPath !== '/dashboard') {
          router.push('/dashboard');
        }
      }
      
      // Verify auth is working properly by making a test API call
      try {
        // Only do this if we should be authenticated
        if (AuthService.isAuthenticated()) {
          console.log("Testing authentication with API call to /users/me");
          const userData = await AuthService.getCurrentUser();
          console.log("Auth check successful:", userData ? "User data received" : "No user data");
        }
      } catch (err) {
        console.error("Auth verification failed:", err);
      }
    };
    
    // Run token processing immediately
    processTokens();
    
    // Check for successful auth via cookies
    const cookies = document.cookie.split(';');
    const authSuccessCookie = cookies.find(cookie => cookie.trim().startsWith('auth_success='));
    
    if (authSuccessCookie && authSuccessCookie.includes('true')) {
      toast.success("You've successfully signed in!");
      
      // Clear the success cookie
      document.cookie = 'auth_success=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax';
    }
    
    // Check for failed auth via cookies
    const authFailedCookie = cookies.find(cookie => cookie.trim().startsWith('auth_failed='));
    
    if (authFailedCookie && authFailedCookie.includes('true')) {
      toast.error("Authentication failed. Please try again.");
      
      // Clear the failed cookie
      document.cookie = 'auth_failed=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax';
    }
  }, [router]);
  
  // This component renders the GoogleAuthHandler which handles specific Google auth errors
  return <GoogleAuthHandler />;
}