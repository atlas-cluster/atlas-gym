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

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')
  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams
  const isSessionExpired = searchParams.get('session_expired') === 'true'

  if (sessionCookie && pathname === AUTH_ROUTE) {
    if (isSessionExpired) {
      const response = NextResponse.next()
      response.cookies.delete('session')
      return response
    }

    return NextResponse.redirect(new URL('/', request.url))
  }

  if (pathname !== AUTH_ROUTE) {
    if (!sessionCookie) {
      const loginUrl = new URL('/auth', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // We trust the existance of the cookie here for performance (Edge).
    // The AppLayout (Server) will validate the session against the DB
    // and redirect back to /auth?session_expired=true if invalid.
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
