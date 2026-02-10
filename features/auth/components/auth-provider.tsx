'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { createContext, useContext, useEffect, useState } from 'react'

import { getSession } from '@/features/auth/actions/get-session'
import { logout as logoutAction } from '@/features/auth/actions/logout'
import { User } from '@/features/auth/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_ROUTE = '/auth'

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
  initialUser?: User | null
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [user, setUser] = useState<User | null>(initialUser || null)
  const [loading, setLoading] = useState(!initialUser)
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialUser)

  // Explicitly handle session expiration cleanup
  useEffect(() => {
    if (searchParams.get('session_expired') === 'true') {
      const cleanup = async () => {
        // Middleware already clears the cookie when session_expired=true is present
        setUser(null)
        setIsAuthenticated(false)
        router.replace('/auth')
      }
      cleanup()
    }
  }, [searchParams, router])

  const fetchUser = async () => {
    try {
      const data = await getSession()

      if (data.authenticated && data.user) {
        setUser(data.user)
        setIsAuthenticated(true)
        return data.user
      } else {
        setUser(null)
        setIsAuthenticated(false)
        return null
      }
    } catch {
      setUser(null)
      setIsAuthenticated(false)
      return null
    }
  }

  const logout = async () => {
    try {
      await logoutAction()
      setUser(null)
      setIsAuthenticated(false)
      router.push('/auth')
    } catch {
      // Even if logout API fails, clear local state
      setUser(null)
      setIsAuthenticated(false)
      router.push('/auth')
    }
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      // For public route, just mark as not loading
      if (pathname === AUTH_ROUTE) {
        setLoading(false)
        return
      }

      // If we already have a user (hydrated from server), we can skip the fetch
      // unless we want to force re-verification.
      // Since AppLayout (Server) validates every page load/nav, we can trust the initial value or existing state
      // for the current view.
      if (user) {
        setLoading(false)
        return
      }

      // For protected routes, validate session with server if we don't have a user
      const currentUser = await fetchUser()

      if (!isMounted) return

      // If session is invalid, redirect to login
      if (!currentUser) {
        const loginUrl = `/auth?redirect=${encodeURIComponent(pathname)}`
        router.push(loginUrl)
        setLoading(false)
        return
      }

      setLoading(false)
    }

    checkAuth()

    return () => {
      isMounted = false
    }
    // We add 'user' to dependency so if it changes (e.g. logout) we re-eval?
    // Actually, we want to run this mostly on mount or path change.
    // If we add 'user', and 'fetchUser' sets user, we might loop if we are not careful.
    // But we check `if (user) return`. So if user is set, we stop.
  }, [pathname, router, user])

  // Always render children - no loading screen
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
