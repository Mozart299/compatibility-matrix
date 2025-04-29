// src/app/api/auth/callback/google/route.ts
import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth-service';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code from the URL
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      // Redirect to login page if code is missing
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }
    
    // Handle the Google callback
    await AuthService.handleGoogleCallback(code);
    
    // Redirect to dashboard upon successful authentication
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Google authentication error:', error);
    
    // Redirect to login page with error
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}