'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'

/**
 * Hook to redirect authenticated users away from public pages
 * Used on login/register pages to redirect logged-in users to home
 */
export function useAuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = (await apiClient.getSession()) as {
          authenticated: boolean
        }
        if (data.authenticated) {
          router.push('/')
        }
      } catch {
        // User is not authenticated, stay on current page
      }
    }
    checkSession()
  }, [router])
}
