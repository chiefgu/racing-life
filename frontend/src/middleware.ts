import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to prelaunch page without authentication
  if (pathname === '/prelaunch') {
    return NextResponse.next();
  }

  // Check for site_access cookie
  const siteAccess = request.cookies.get('site_access');

  // If no valid cookie, redirect to prelaunch
  if (!siteAccess || siteAccess.value !== 'true') {
    return NextResponse.redirect(new URL('/prelaunch', request.url));
  }

  return NextResponse.next();
}

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
