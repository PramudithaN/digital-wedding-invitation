import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const adminSession = request.cookies.get('admin_session');
  const path = request.nextUrl.pathname;

  // Protect admin routes
  const protectedPrefixes = [
    '/dashboard',
    '/guests',
    '/rsvp',
    '/tables',
    '/categories',
    '/seating-upload',
    '/analytics',
    '/settings'
  ];

  const isProtected = protectedPrefixes.some(prefix => 
    path === prefix || path.startsWith(prefix + '/')
  );

  if (isProtected && !adminSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  // Handle root route '/'
  if (path === '/') {
    if (adminSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/find-table', request.url));
    }
  }

  // If already authenticated and visiting /login, redirect to /dashboard
  if (path === '/login' && adminSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - invite (public invite cards)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|invite).*)',
  ],
};
