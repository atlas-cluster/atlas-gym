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
    try {
      const data = (await apiClient.getSession()) as {
        authenticated: boolean
        user?: UserData
      }

      if (data.authenticated && data.user) {
        setUser(data.user)
        setIsAuthenticated(true)
        return true
      } else {
        setUser(null)
        setIsAuthenticated(false)
        return false
      }
    } catch (error) {
      console.error('[Auth] Session fetch error:', error)
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
      // On public routes, just mark as not loading
      if (PUBLIC_ROUTES.includes(pathname)) {
        if (isMounted) setLoading(false)
        return
      }

      // Quick check: if no session cookie exists, redirect immediately
      const hasSessionCookie = document.cookie
        .split('; ')
        .some((cookie) => cookie.startsWith('session='))

      if (!hasSessionCookie) {
        // No cookie means no session - instant redirect to login
        if (isMounted) {
          setLoading(false)
          const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
          router.push(loginUrl)
        }
        return
      }

      // Has cookie - validate session in background
      const authenticated = await fetchUser()

      if (!isMounted) return

      // Mark loading as complete
      setLoading(false)

      if (!authenticated) {
        // Redirect to login with return URL
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
        router.push(loginUrl)
      }
    }

    checkAuth()

    return () => {
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
