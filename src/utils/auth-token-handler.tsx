"use client";

import React, { useEffect } from 'react';
import GoogleAuthHandler from '@/components/auth/GoogleAuthHandler';
import AuthService from '@/lib/auth-service';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function AuthTokenHandler() {
  const router = useRouter();
  
  useEffect(() => {
    // Process any potential Google OAuth tokens
    const tokenProcessed = AuthService.processGoogleAuthTokens();
    if (tokenProcessed) {
      console.log("Google auth tokens processed");
      
      // Get the current pathname
      const currentPath = window.location.pathname;
      
      // If we're already on the dashboard, don't redirect again
      if (currentPath !== '/dashboard') {
        router.push('/dashboard');
      }
    }
    
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
