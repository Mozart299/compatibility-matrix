// src/components/auth/GoogleAuthButton.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import AuthService from "@/lib/auth-service";
import { toast } from 'sonner';

interface GoogleAuthButtonProps {
  className?: string;
  fullWidth?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  isLoading?: boolean;
  text?: string;
}

// Helper function to generate code verifier for PKCE
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => String.fromCharCode(byte)).join('');
}

// Helper function to base64 URL encode a string
function base64UrlEncode(str: string): string {
  // Convert the string to base64
  let encoded = btoa(str);
  // Replace characters according to base64url specifications
  encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return encoded;
}

export function GoogleAuthButton({
  className = "",
  fullWidth = false,
  variant = "outline",
  isLoading = false,
  text = "Sign in with Google"
}: GoogleAuthButtonProps) {
  const [localLoading, setLocalLoading] = React.useState(false);
  
  const loading = isLoading || localLoading;

  const handleGoogleSignIn = async () => {
    try {
      setLocalLoading(true);
      
      // Generate and store code verifier for PKCE (Proof Key for Code Exchange)
      const codeVerifier = base64UrlEncode(generateCodeVerifier());
      
      // Store the code verifier in localStorage to be used in the callback
      localStorage.setItem('code_verifier', codeVerifier);
      
      // Set a cookie with the code verifier as well for redundancy
      document.cookie = `code_verifier=${codeVerifier}; path=/; secure; samesite=lax; max-age=300`; // 5 minutes expiry
      
      // Get the Google auth URL from the backend
      const response = await AuthService.getGoogleAuthUrl(codeVerifier);
      
      console.log("Google auth response received");
      
      // Handle the auth URL from the response
      if (response) {
        let redirectUrl = null;
        
        // Handle nested auth_url object with url property
        if (response.auth_url && response.auth_url.url) {
          redirectUrl = response.auth_url.url;
        }
        // Alternative - check if auth_url itself is a string
        else if (typeof response.auth_url === 'string') {
          redirectUrl = response.auth_url;
        }
        // Additional check for url property directly in response
        else if (response.url) {
          redirectUrl = response.url;
        }
        
        if (redirectUrl) {
          console.log("Redirecting to Google auth URL: " + redirectUrl);
          window.location.href = redirectUrl;
          return;
        }
      }
      
      console.error("Invalid auth URL format:", response);
      toast.error("Unable to initiate Google sign-in. Please try again later.");
      setLocalLoading(false);
    } catch (error) {
      console.error("Error initiating Google sign-in:", error);
      toast.error("Failed to connect to Google. Please try again.");
      setLocalLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting...
        </span>
      ) : (
        <span className="flex items-center">
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          {text}
        </span>
      )}
    </Button>
  );
}