'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { User } from '@/app/auth/model'
import { getCurrentUser, logoutUser } from '@/app/auth/actions'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Public route that don't require authentication
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
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const fetchUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser()

      if (userData) {
        setUser(userData)
        setIsAuthenticated(true)
        return userData
      } else {
        setUser(null)
        setIsAuthenticated(false)
        return null
      }
    } catch {
      // Silently handle auth errors - user will be redirected to login
      setUser(null)
      setIsAuthenticated(false)
      return null
    }
  }, [])

  const logout = async () => {
    try {
      await logoutUser()

      setUser(null)
      setIsAuthenticated(false)
      router.push('/auth?logout=true')
    } catch {
      // Even if logout API fails, clear local state
      setUser(null)
      setIsAuthenticated(false)
      router.push('/auth?logout=true')
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

      // For protected routes, validate session with server
      const currentUser = await fetchUser()

      if (!isMounted) return

      // If session is invalid, redirect to login
      if (!currentUser) {
        const loginUrl = `/auth?redirect=${encodeURIComponent(pathname)}&logout=true`
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
  }, [pathname, router, fetchUser])

  // Always render children - no loading screen
  // Components will use skeleton states while loading is true
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
