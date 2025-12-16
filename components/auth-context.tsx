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

  // Initialize with no user data to ensure server and client render the same
  // This prevents hydration errors caused by localStorage being unavailable on server
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const fetchUser = async () => {
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
    } catch {
      // Silently handle auth errors - user will be redirected to login
      setUser(null)
      setIsAuthenticated(false)
      return false
    }
  }

  const logout = async () => {
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
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      // For public routes, just mark as not loading
      if (PUBLIC_ROUTES.includes(pathname)) {
        setLoading(false)
        return
      }

      // For protected routes, validate session with server
      const authenticated = await fetchUser()

      if (!isMounted) return

      // If session is invalid, redirect to login
      if (!authenticated) {
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
        router.push(loginUrl)
      }

      setLoading(false)
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [pathname, router])

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
