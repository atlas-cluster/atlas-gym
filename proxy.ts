import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Proxy to handle authentication redirects
 * Runs on the server before the page loads, preventing flash of login/register pages
 * 
 * Note: This only checks for cookie existence, not validity.
 * Invalid/expired sessions will be caught by the AuthProvider and redirected back to login.
 */
export default function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')
  const pathname = request.nextUrl.pathname

  // If user has a session cookie and tries to access login/register, redirect to home
  if (sessionCookie && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Configure which routes this proxy should run on
export const config = {
  matcher: ['/login', '/register'],
}
