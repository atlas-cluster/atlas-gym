import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Proxy to handle authentication redirects
 * Runs on the Edge Runtime before the page loads, preventing flash of wrong pages
 *
 * Simply checks for session cookie existence for fast redirects.
 * Invalid cookies are handled by the AuthProvider on the client side.
 */

const AUTH_ROUTE = '/auth'

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')
  const pathname = request.nextUrl.pathname
  const isLogout = request.nextUrl.searchParams.get('logout')

  // If user has a session cookie and tries to access login/register, redirect to home
  // The AuthProvider will validate the session and redirect back to login if invalid
  if (sessionCookie && pathname === AUTH_ROUTE && !isLogout) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If user doesn't have a session cookie and tries to access protected route, redirect to login
  if (!sessionCookie && pathname !== AUTH_ROUTE) {
    const loginUrl = new URL('/auth', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Configure which routes this proxy should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api/auth (excluded API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, other static assets
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
