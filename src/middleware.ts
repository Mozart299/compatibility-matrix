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
  const { pathname } = request.nextUrl;
  
  // Get auth token from cookies
  const token = request.cookies.get("accessToken")?.value;
  const isAuthenticated = !!token;
  
  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Check if the route is an auth route (login/signup)
  const isAuthRoute = authRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Redirect logic
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login if trying to access protected route without auth
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  
  if (isAuthRoute && isAuthenticated) {
    // Redirect to dashboard if already authenticated and trying to access auth routes
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  return NextResponse.next();
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