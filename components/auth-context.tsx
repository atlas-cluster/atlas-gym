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
function getCachedAuthState(): { isAuthenticated: boolean; user: UserData | null } {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null }
  }
  
  try {
    const authState = localStorage.getItem(AUTH_STATE_KEY)
    const userData = localStorage.getItem(USER_DATA_KEY)
    
    if (authState === 'true' && userData) {
      return {
        isAuthenticated: true,
        user: JSON.parse(userData) as UserData,
      }
    }
  } catch (error) {
    console.error('Error reading cached auth state:', error)
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
  
  // Initialize with cached state for instant rendering
  const cachedState = getCachedAuthState()
  const [user, setUser] = useState<UserData | null>(cachedState.user)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(cachedState.isAuthenticated)

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
      // For public routes, just mark as not loading
      if (PUBLIC_ROUTES.includes(pathname)) {
        setLoading(false)
        return
      }

      // For protected routes, validate session in background
      const authenticated = await fetchUser()

      if (!isMounted) return

      // If session is invalid and we don't have cached auth, redirect
      if (!authenticated) {
        // Only redirect if we also don't have a cached authenticated state
        // This prevents flash when session expires but localStorage still has data
        const cached = getCachedAuthState()
        if (!cached.isAuthenticated) {
          const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
          router.push(loginUrl)
        } else {
          // Session expired but we had cached state - redirect after brief moment
          // This allows the user to see the UI briefly before redirect
          setTimeout(() => {
            const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
            router.push(loginUrl)
          }, 100)
        }
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
