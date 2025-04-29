// src/app/api/auth/callback/google/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Get the backend API URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code from the URL
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    // Handle errors from Google's OAuth
    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
    }

    if (!code) {
      console.error('No authorization code received from Google');
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    console.log('Received Google auth code:', code.substring(0, 10) + '...');

    // Forward the code to your backend using form data as expected by the backend
    const formData = new FormData();
    formData.append('code', code);
    
    const response = await axios.post(`${API_BASE_URL}/auth/callback/google`, formData);

    if (!response.data || !response.data.access_token) {
      console.error('Invalid response from backend:', response.data);
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }

    console.log('Successfully received tokens from backend');

    // Create the redirect response first
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));

    // Set tokens in localStorage via cookies
    // Create a temporary cookie that will be read by client-side code
    redirectResponse.cookies.set('googleAuthToken', response.data.access_token, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // So client JS can read it
      maxAge: 30, // Short-lived - just long enough for the client to read
      sameSite: 'lax'
    });

    // Also set the HTTP-only cookie for auth middleware
    redirectResponse.cookies.set('accessToken', response.data.access_token, {
      path: '/',
      secure: process.env.NODE_ENV === 'production', 
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    if (response.data.refresh_token) {
      redirectResponse.cookies.set('refreshToken', response.data.refresh_token, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }

    // Add a success flag for UI messaging
    redirectResponse.cookies.set('auth_success', 'true', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
      maxAge: 30, // Short-lived
      sameSite: 'lax'
    });

    return redirectResponse;
  } catch (error: any) {
    console.error('Google authentication error:', error);

    // Extract error details for better debugging
    let errorMessage = 'auth_failed';
    if (error.response) {
      console.error('Backend response error:', JSON.stringify(error.response.data));
      errorMessage = `backend_error_${error.response.status}`;
    } else if (error.request) {
      console.error('No response received from backend');
      errorMessage = 'backend_no_response';
    } else {
      console.error('Error setting up request:', error.message);
      errorMessage = 'request_setup_error';
    }

    // Redirect to login page with specific error
    return NextResponse.redirect(new URL(`/login?error=${errorMessage}`, request.url));
  }
}