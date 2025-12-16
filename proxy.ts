import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Proxy to handle authentication redirects
 * Runs on the Edge Runtime before the page loads, preventing flash of wrong pages
 *
 * Simply checks for session cookie existence for fast redirects.
 * Invalid cookies are handled by the AuthProvider on the client side.
 */

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register']

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')
  const pathname = request.nextUrl.pathname

  // If user has a session cookie and tries to access login/register, redirect to home
  // The AuthProvider will validate the session and redirect back to login if invalid
  if (sessionCookie && PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If user doesn't have a session cookie and tries to access protected route, redirect to login
  if (!sessionCookie && !PUBLIC_ROUTES.includes(pathname)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Configure which routes this proxy should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, other static assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
