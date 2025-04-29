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
      return NextResponse.redirect(new URL(`/signup?error=${error}`, request.url)); // Changed to /signup
    }

    if (!code) {
      console.error('No authorization code received from Google');
      return NextResponse.redirect(new URL('/signup?error=no_code', request.url)); // Changed to /signup
    }

    console.log('Received Google auth code, forwarding to backend');

    // Forward the code to your backend
    const response = await axios.post(`${API_BASE_URL}/auth/callback/google`, { code });

    if (!response.data || !response.data.access_token) {
      console.error('Invalid response from backend:', response.data);
      return NextResponse.redirect(new URL('/signup?error=invalid_token', request.url)); // Changed to /signup
    }

    // Set cookies with appropriate security settings
    const cookieOptions = {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    };

    // Set the response with cookies and redirect
    const redirectResponse = NextResponse.redirect(new URL('/dashboard?google_success=true', request.url)); // Added query param

    // Set the access token as a client-accessible cookie
    redirectResponse.cookies.set('accessToken', response.data.access_token, cookieOptions);

    // Set a flag for client-side success message
    redirectResponse.cookies.set('googleAuthSuccess', 'true', {
      ...cookieOptions,
      httpOnly: false,
      maxAge: 60, // Short-lived cookie
    });

    return redirectResponse;
  } catch (error: any) {
    console.error('Google authentication error:', error);

    // Extract error details for better debugging
    let errorMessage = 'auth_failed';
    if (error.response) {
      console.error('Backend response error:', error.response.data);
      errorMessage = `backend_error_${error.response.status}`;
    } else if (error.request) {
      console.error('No response received from backend');
      errorMessage = 'backend_no_response';
    } else {
      console.error('Error setting up request:', error.message);
      errorMessage = 'request_setup_error';
    }

    // Redirect to signup page with specific error
    return NextResponse.redirect(new URL(`/signup?error=${errorMessage}`, request.url)); // Changed to /signup
  }
}