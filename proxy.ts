import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware to handle authentication redirects
 * Runs on the Edge Runtime before the page loads, preventing flash of login/register pages
 *
 * Simply checks for session cookie existence for fast redirects.
 * Invalid cookies are handled by the AuthProvider on the client side.
 */
export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')
  const pathname = request.nextUrl.pathname

  // If user has a session cookie and tries to access login/register, redirect to home
  // The AuthProvider will validate the session and redirect back to login if invalid
  if (sessionCookie && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Configure which routes this middleware should run on
export const config = {
  matcher: ['/login', '/register'],
}
