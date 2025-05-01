// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

// Define which routes require authentication
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/matrix",
  "/assessment",
  "/connections",
  "/compatibility"
];

// Define public routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Debug info
  console.log(`Middleware processing path: ${pathname}`);
  
  // Check if this is a Google OAuth callback (code in query params at root)
  const code = searchParams.get('code');
  if (pathname === '/' && code) {
    console.log('Intercepting Google auth callback at root path');
    // Redirect to our proper callback handler
    return NextResponse.redirect(new URL(`/api/auth/callback/google?code=${code}`, request.url));
  }
  
  // Get auth token from cookies - try both accessToken and googleAuthToken
  const accessToken = request.cookies.get("accessToken")?.value;
  const googleAuthToken = request.cookies.get("googleAuthToken")?.value;
  const isAuthenticated = !!accessToken || !!googleAuthToken;
  
  console.log(`Auth check for ${pathname}: authenticated=${isAuthenticated}, accessToken=${!!accessToken}, googleAuthToken=${!!googleAuthToken}`);
  
  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Check if the route is an auth route (login/signup)
  const isAuthRoute = authRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Special handling for root path
  if (pathname === "/") {
    // If authenticated, redirect to dashboard
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Otherwise, let the homepage render normally
    return NextResponse.next();
  }
  
  // Redirect logic
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login if trying to access protected route without auth
    console.log(`Redirecting from protected route ${pathname} to login (not authenticated)`);
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  
  if (isAuthRoute && isAuthenticated) {
    // Redirect to dashboard if already authenticated and trying to access auth routes
    console.log(`Redirecting from auth route ${pathname} to dashboard (already authenticated)`);
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // Modify response to inject auth token if present in cookies
  const response = NextResponse.next();
  
  // If we're using the googleAuthToken, we can optionally promote it to a proper accessToken
  if (!accessToken && googleAuthToken && isAuthenticated) {
    response.cookies.set('accessToken', googleAuthToken, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true, 
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
    });
  }
  
  return response;
}

// Configure middleware to run only on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};