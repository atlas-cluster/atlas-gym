import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'

/**
 * Proxy to handle authentication redirects
 * Runs on the server before the page loads, preventing flash of login/register pages
 * 
 * Validates session cookie to prevent infinite loops with broken/expired cookies.
 * If cookie is invalid, allows access to login/register pages.
 */
export default async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')
  const pathname = request.nextUrl.pathname

  // If user has a session cookie and tries to access login/register
  if (sessionCookie && (pathname === '/login' || pathname === '/register')) {
    // Validate the session to prevent infinite loops with broken cookies
    const session = await getSession(sessionCookie.value)
    
    if (session) {
      // Valid session - redirect to home
      return NextResponse.redirect(new URL('/', request.url))
    }
    // Invalid/expired session - let them access login/register
    // (could also clear the cookie here, but AuthProvider will handle it)
  }

  return NextResponse.next()
}

// Configure which routes this proxy should run on
export const config = {
  matcher: ['/login', '/register'],
}
