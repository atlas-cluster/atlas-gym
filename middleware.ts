import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'

/**
 * Middleware to handle authentication redirects and cookie cleanup
 * Runs on the server before the page loads, preventing flash of login/register pages
 * 
 * Validates session cookie to prevent infinite loops with broken/expired cookies.
 * Clears invalid cookies when user accesses login/register pages.
 */
export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')
  const pathname = request.nextUrl.pathname

  // If user has a session cookie and tries to access login/register
  if (sessionCookie && (pathname === '/login' || pathname === '/register')) {
    try {
      // Validate the session to prevent infinite loops with broken cookies
      const session = await getSession(sessionCookie.value)
      
      if (session) {
        // Valid session - redirect to home
        console.log('[Middleware] Valid session found, redirecting to home')
        return NextResponse.redirect(new URL('/', request.url))
      } else {
        // Invalid/expired session - clear the cookie and allow access to login/register
        console.log('[Middleware] Invalid session, clearing cookie')
        const response = NextResponse.next()
        response.cookies.delete('session')
        return response
      }
    } catch (error) {
      // If validation fails, log error and clear cookie to be safe
      console.error('[Middleware] Error validating session:', error)
      const response = NextResponse.next()
      response.cookies.delete('session')
      return response
    }
  }

  return NextResponse.next()
}

// Configure which routes this middleware should run on
export const config = {
  matcher: ['/login', '/register'],
}
