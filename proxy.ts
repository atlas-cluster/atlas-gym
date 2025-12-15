import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth pages that don't require authentication
const AUTH_ROUTES = ['/login', '/register']

/**
 * Middleware to handle authentication redirects
 * Runs on the Edge Runtime before the page loads, preventing flash of content
 *
 * Simply checks for session cookie existence for fast redirects.
 * Invalid cookies are handled by the AuthProvider on the client side.
 */
export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')
  const pathname = request.nextUrl.pathname

  const isAuthRoute = AUTH_ROUTES.includes(pathname)

  // If user has a session cookie and tries to access login/register, redirect to home
  // The AuthProvider will validate the session and redirect back to login if invalid
  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If user has no session cookie and tries to access protected routes, redirect to login
  if (!sessionCookie && !isAuthRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}
