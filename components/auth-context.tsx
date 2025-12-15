'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { UserData } from '@/lib/schemas'
import { apiClient } from '@/lib/api'

interface AuthContextType {
  user: UserData | null
  loading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register']

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const fetchUser = React.useCallback(async () => {
    console.log('[AuthContext] fetchUser called')
    try {
      const data = (await apiClient.getSession()) as {
        authenticated: boolean
        user?: UserData
      }

      console.log('[AuthContext] Session data:', data)

      if (data.authenticated && data.user) {
        console.log('[AuthContext] Setting user:', data.user)
        setUser(data.user)
        setIsAuthenticated(true)
        return true
      } else {
        console.log('[AuthContext] Not authenticated')
        setUser(null)
        setIsAuthenticated(false)
        return false
      }
    } catch (error) {
      // Silently handle auth errors - user will be redirected to login
      console.error('[AuthContext] fetchUser error:', error)
      setUser(null)
      setIsAuthenticated(false)
      return false
    }
  }, [])

  const logout = React.useCallback(async () => {
    try {
      await apiClient.logout()
      setUser(null)
      setIsAuthenticated(false)
      router.push('/login')
    } catch {
      // Even if logout API fails, clear local state
      setUser(null)
      setIsAuthenticated(false)
      router.push('/login')
    }
  }, [router])

  const refreshUser = React.useCallback(async () => {
    await fetchUser()
  }, [fetchUser])

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      console.log('[AuthContext] checkAuth started, pathname:', pathname, 'loading:', loading)
      
      // On public routes, just mark as not loading
      if (PUBLIC_ROUTES.includes(pathname)) {
        console.log('[AuthContext] Public route, setting loading to false')
        setLoading(false)
        return
      }

      // Quick check: if no session cookie exists, redirect immediately
      const hasSessionCookie = document.cookie
        .split('; ')
        .some((cookie) => cookie.startsWith('session='))

      console.log('[AuthContext] Has session cookie:', hasSessionCookie)

      if (!hasSessionCookie) {
        // No cookie means no session - instant redirect to login
        if (isMounted) {
          console.log('[AuthContext] No session cookie, redirecting to login')
          setLoading(false)
          const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
          router.push(loginUrl)
        }
        return
      }

      // Has cookie - validate session in background
      console.log('[AuthContext] Validating session...')
      const authenticated = await fetchUser()

      if (!isMounted) {
        console.log('[AuthContext] Component unmounted, aborting')
        return
      }

      console.log('[AuthContext] Validation complete, authenticated:', authenticated)

      // Mark loading as complete
      setLoading(false)
      console.log('[AuthContext] Loading set to false')

      if (!authenticated) {
        // Redirect to login with return URL
        console.log('[AuthContext] Not authenticated, redirecting to login')
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
        router.push(loginUrl)
      } else {
        console.log('[AuthContext] Authenticated, staying on page')
      }
    }

    checkAuth()

    return () => {
      console.log('[AuthContext] Cleanup, setting isMounted to false')
      isMounted = false
    }
  }, [pathname, router, fetchUser])

  // Don't block rendering - show page immediately with loading states
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        logout,
        refreshUser,
      }}>
      {children}
    </AuthContext.Provider>
  )
}
