'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Hook to redirect authenticated users away from public pages
 * Used on login/register pages to redirect logged-in users to home
 * 
 * Checks for session cookie existence for instant redirect.
 * If the cookie is invalid, the user will be redirected back by the auth provider.
 */
export function useAuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Check if session cookie exists for instant redirect
    const hasSessionCookie = document.cookie
      .split('; ')
      .some((cookie) => cookie.startsWith('session='))

    if (hasSessionCookie) {
      router.push('/')
    }
  }, [router])
}
