// src/app/api/auth/callback/google/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Get the backend API URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

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
      // Redirect to login page if code is missing
      console.error('No authorization code received from Google');
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }
    
    console.log('Received Google auth code, forwarding to backend');
    
    // Forward the code to your backend
    const response = await axios.post(`${API_BASE_URL}/auth/callback/google`, { code });
    
    if (!response.data || !response.data.access_token) {
      console.error('Invalid response from backend:', response.data);
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }
    
    // Store tokens in cookies (secure in production)
    const { access_token, refresh_token } = response.data;
    
    // Set cookies with appropriate security settings
    const cookieOptions = {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax' as const,
    };
    
    // Set the response with cookies and redirect
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));
    
    // Set the access token as a client-accessible cookie (for the frontend)
    redirectResponse.cookies.set('accessToken', access_token, cookieOptions);
    
    // Store tokens in localStorage via a script that will run on the client
    // We'll use the frontend auth service to handle this after redirect
    
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
      errorMessage = `request_setup_error`;
    }
    
    // Redirect to login page with specific error
    return NextResponse.redirect(new URL(`/login?error=${errorMessage}`, request.url));
  }
}