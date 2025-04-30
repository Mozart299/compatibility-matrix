"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from "sonner";
import AuthService from '@/lib/auth-service';

/**
 * This component handles Google OAuth callback parameters
 * and shows appropriate messages to the user
 */
export function GoogleAuthHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    // Check if we have Google auth tokens in cookies and process them
    const tokenProcessed = AuthService.processGoogleAuthTokens();
    if (tokenProcessed) {
      toast.success("Successfully signed in with Google!");
      router.push('/dashboard');
      return;
    }
    
    // Check for Google auth error
    const error = searchParams.get('error');
    if (error) {
      let errorMessage = "Authentication failed.";
      
      // Provide more specific messages based on error code
      switch (error) {
        case 'access_denied':
          errorMessage = "You denied the authentication request.";
          break;
        case 'no_code':
          errorMessage = "No authentication code was received.";
          break;
        case 'invalid_token':
          errorMessage = "Could not validate your authentication.";
          break;
        case 'missing_code_verifier':
          errorMessage = "Authentication verification failed. Please try again.";
          break;
        case 'backend_no_response':
          errorMessage = "Our server is not responding. Please try again later.";
          break;
        default:
          if (error.startsWith('backend_error_')) {
            const statusCode = error.replace('backend_error_', '');
            errorMessage = `Server error (${statusCode}). Please try again later.`;
          }
      }
      
      toast.error(errorMessage);
    }
    
    // Check for successful Google signup via cookies
    const cookies = document.cookie.split(';');
    const authSuccessCookie = cookies.find(cookie => cookie.trim().startsWith('auth_success='));
    
    if (authSuccessCookie && authSuccessCookie.includes('true')) {
      toast.success("You've successfully signed in with Google!");
      
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
  }, [searchParams, router]);
  
  // This component doesn't render anything
  return null;
}

export default GoogleAuthHandler;