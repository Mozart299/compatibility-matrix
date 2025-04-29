
"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from "sonner";

/**
 * This component handles Google OAuth callback parameters
 * and shows appropriate messages to the user
 */
export function GoogleAuthHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  useEffect(() => {
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
        case 'backend_no_response':
          errorMessage = "Our server is not responding. Please try again later.";
          break;
        default:
          if (error.startsWith('backend_error_')) {
            const statusCode = error.replace('backend_error_', '');
            errorMessage = `Server error (${statusCode}). Please try again later.`;
          }
      }
      
      toast(errorMessage);
    }
    
    // Check for successful Google signup
    const googleSuccess = searchParams.get('google_success');
    if (googleSuccess === 'true') {
      toast("You've successfully signed in with Google!");
    }
  }, [searchParams, toast, router]);
  
  // This component doesn't render anything
  return null;
}