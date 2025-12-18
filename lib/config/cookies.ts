/**
 * Secure cookie configuration
 */

export const COOKIE_CONFIG = {
  session: {
    name: 'session',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const, // Compatible with Safari/iOS while maintaining CSRF protection
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    },
  },
} as const

/**
 * Get secure cookie options for session
 */
export function getSecureCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  }
}
