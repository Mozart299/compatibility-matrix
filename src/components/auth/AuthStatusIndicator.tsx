// src/components/auth/AuthStatusIndicator.tsx
"use client";

import { useEffect, useState } from 'react';
import AuthService from '@/lib/auth-service';

/**
 * This is a debugging component that shows the current auth status
 * You can add this to your layout or dashboard temporarily to debug auth issues
 */
export function AuthStatusIndicator() {
  const [status, setStatus] = useState<{
    isAuthenticated: boolean;
    hasAuthTokens: boolean;
    hasAccessTokenCookie: boolean;
    hasGoogleTokenCookie: boolean;
    hasRefreshTokenCookie: boolean;
    axiosAuthHeader: string | null;
  }>({
    isAuthenticated: false,
    hasAuthTokens: false,
    hasAccessTokenCookie: false,
    hasGoogleTokenCookie: false,
    hasRefreshTokenCookie: false,
    axiosAuthHeader: null
  });

  useEffect(() => {
    // Function to check auth status
    const checkAuthStatus = () => {
      const cookies = document.cookie.split(';');
      const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
      const googleAuthTokenCookie = cookies.find(cookie => cookie.trim().startsWith('googleAuthToken='));
      const refreshTokenCookie = cookies.find(cookie => cookie.trim().startsWith('refreshToken='));
      
      // For debugging only - get first few chars of token
      let authHeader = null;
      try {
        // @ts-ignore - accessing a private property for debugging
        const axiosHeader = AuthService.axiosInstance?.defaults?.headers?.common?.['Authorization'];
        if (axiosHeader && typeof axiosHeader === 'string') {
          authHeader = axiosHeader.substring(0, 15) + '...';
        }
      } catch (e) {
        console.error("Error getting axios header:", e);
      }
      
      setStatus({
        isAuthenticated: AuthService.isAuthenticated(),
        hasAuthTokens: !!localStorage.getItem('authTokens') || !!sessionStorage.getItem('authTokens'),
        hasAccessTokenCookie: !!accessTokenCookie,
        hasGoogleTokenCookie: !!googleAuthTokenCookie,
        hasRefreshTokenCookie: !!refreshTokenCookie,
        axiosAuthHeader: authHeader
      });
    };
    
    // Check immediately and then set up interval
    checkAuthStatus();
    const interval = setInterval(checkAuthStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Simple indicator styling
  const styles = {
    container: {
      position: 'fixed' as const,
      bottom: '10px',
      right: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    },
    item: {
      display: 'flex',
      justifyContent: 'space-between',
      margin: '4px 0'
    },
    status: (isActive: boolean) => ({
      color: isActive ? '#4ade80' : '#ef4444',
      fontWeight: 'bold' as const
    })
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.item}>
        <span>Auth Status:</span>
        <span style={styles.status(status.isAuthenticated)}>
          {status.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
        </span>
      </div>
      <div style={styles.item}>
        <span>Auth Tokens:</span>
        <span style={styles.status(status.hasAuthTokens)}>
          {status.hasAuthTokens ? 'Present' : 'Missing'}
        </span>
      </div>
      <div style={styles.item}>
        <span>Access Token Cookie:</span>
        <span style={styles.status(status.hasAccessTokenCookie)}>
          {status.hasAccessTokenCookie ? 'Present' : 'Missing'}
        </span>
      </div>
      <div style={styles.item}>
        <span>Google Token Cookie:</span>
        <span style={styles.status(status.hasGoogleTokenCookie)}>
          {status.hasGoogleTokenCookie ? 'Present' : 'Missing'}
        </span>
      </div>
      <div style={styles.item}>
        <span>Axios Auth Header:</span>
        <span style={styles.status(!!status.axiosAuthHeader)}>
          {status.axiosAuthHeader || 'Missing'}
        </span>
      </div>
    </div>
  );
}