

/**
 * Reads tokens from cookies and stores them in localStorage/sessionStorage
 * This is needed because the Google Auth callback can only set cookies,
 * but our app uses localStorage for token persistence
 * 
 */
export function handleAuthTokens(rememberMe: boolean = true): boolean {
    try {
      // Check for the temporary auth token cookie
      const googleAuthToken = getCookie('googleAuthToken');
      
      if (googleAuthToken) {
        console.log('Found Google auth token in cookies');
        
        // Store in appropriate storage
        const storage = rememberMe ? localStorage : sessionStorage;
        
        // Get refresh token if available
        const refreshToken = getCookie('refreshToken') || '';
        
        // Store tokens
        storage.setItem('authTokens', JSON.stringify({
          accessToken: googleAuthToken,
          refreshToken
        }));
        
        // Clear the temporary cookies
        document.cookie = 'googleAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax';
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error handling auth tokens:', error);
      return false;
    }
  }
  
  /**
   * Helper function to get a cookie value by name
   */
  function getCookie(name: string): string | null {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1);
      }
    }
    return null;
  }
  
  /**
   * Check if the user successfully authenticated
   */
  export function checkAuthSuccess(): boolean {
    const authSuccess = getCookie('auth_success');
    if (authSuccess === 'true') {
      // Clear the success flag
      document.cookie = 'auth_success=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax';
      return true;
    }
    return false;
  }