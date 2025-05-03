// src/components/auth/GoogleAuthHandler.tsx
"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from "sonner";
import AuthService, { initializeAuthHeaders, isBrowser } from '@/lib/auth-service';

/**
 * This component handles Google OAuth callback parameters
 * and shows appropriate messages to the user
 */
export function GoogleAuthHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    // Skip if not in browser
    if (!isBrowser()) return;
    
    // Initialize auth headers first
    initializeAuthHeaders();
    
    // Check if we have Google auth tokens in cookies and process them
    const handleGoogleAuth = () => {
      // Log cookies for debugging
      console.log("Cookies at GoogleAuthHandler:", document.cookie);
      
      const tokenProcessed = AuthService.processGoogleAuthTokens();
      if (tokenProcessed) {
        console.log("GoogleAuthHandler: Tokens processed successfully");
        toast.success("Successfully signed in with Google!");
        
        return true;
      }
      return false;
    };
    
    // Process tokens first
    const processed = handleGoogleAuth();
    if (processed) return;
    
    // Then check for Google auth error
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
      
      // Clear any stored code verifiers since they failed
      if (isBrowser()) {
        localStorage.removeItem('google_code_verifier');
        document.cookie = 'code_verifier=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax';
      }
    }
  }, [searchParams, router]);
  
  // This component doesn't render anything
  return null;
}