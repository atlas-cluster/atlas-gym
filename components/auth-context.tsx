'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { UserData } from '@/lib/schemas'
import { userDataSchema } from '@/lib/schemas/validation'
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

// Local storage keys
const AUTH_STATE_KEY = 'atlas_auth_state'
const USER_DATA_KEY = 'atlas_user_data'

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

// Helper to get cached auth state from localStorage
function getCachedAuthState(): {
  isAuthenticated: boolean
  user: UserData | null
} {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null }
  }

  try {
    const authState = localStorage.getItem(AUTH_STATE_KEY)
    const userData = localStorage.getItem(USER_DATA_KEY)

    if (authState === 'true' && userData) {
      const parsedData = JSON.parse(userData)

      // Validate parsed data against schema
      const validationResult = userDataSchema.safeParse(parsedData)
      if (validationResult.success) {
        return {
          isAuthenticated: true,
          user: validationResult.data as UserData,
        }
      } else {
        // Invalid data in localStorage - clear it
        console.warn(
          'Invalid cached user data, clearing:',
          validationResult.error
        )
        localStorage.removeItem(AUTH_STATE_KEY)
        localStorage.removeItem(USER_DATA_KEY)
      }
    }
  } catch (error) {
    console.error('Error reading cached auth state:', error)
    // Clear potentially corrupted data
    try {
      localStorage.removeItem(AUTH_STATE_KEY)
      localStorage.removeItem(USER_DATA_KEY)
    } catch {
      // Ignore errors when clearing
    }
  }

  return { isAuthenticated: false, user: null }
}

// Helper to cache auth state to localStorage
function cacheAuthState(isAuthenticated: boolean, user: UserData | null) {
  if (typeof window === 'undefined') return

  try {
    if (isAuthenticated && user) {
      localStorage.setItem(AUTH_STATE_KEY, 'true')
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(AUTH_STATE_KEY)
      localStorage.removeItem(USER_DATA_KEY)
    }
  } catch (error) {
    console.error('Error caching auth state:', error)
  }
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
        cacheAuthState(true, data.user)
        return true
      } else {
        setUser(null)
        setIsAuthenticated(false)
        cacheAuthState(false, null)
        return false
      }
    } catch {
      // Silently handle auth errors - user will be redirected to login
      setUser(null)
      setIsAuthenticated(false)
      cacheAuthState(false, null)
      return false
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
      setUser(null)
      setIsAuthenticated(false)
      cacheAuthState(false, null)
      router.push('/login')
    } catch {
      // Even if logout API fails, clear local state
      setUser(null)
      setIsAuthenticated(false)
      cacheAuthState(false, null)
      router.push('/login')
    }
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      // Load cached data immediately on client mount for better UX
      // This happens after initial render, so no hydration mismatch
      const cached = getCachedAuthState()
      if (cached.isAuthenticated && cached.user) {
        setUser(cached.user)
        setIsAuthenticated(cached.isAuthenticated)
      }

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
