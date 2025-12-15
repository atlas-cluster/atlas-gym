'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { UserData } from '@/lib/schemas'
import { apiClient } from '@/lib/api'
import { Progress } from '@/components/ui/progress'

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
  const [progress, setProgress] = useState(0)

  const fetchUser = async () => {
    try {
      const data = await apiClient.getSession() as { authenticated: boolean; user?: UserData }

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
      console.error('Failed to fetch user:', error)
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
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  useEffect(() => {
    const checkAuth = async () => {
      if (PUBLIC_ROUTES.includes(pathname)) {
        setLoading(false)
        return
      }

      // Simulate progress for better UX
      setProgress(30)
      
      const authenticated = await fetchUser()
      setProgress(70)

      if (!authenticated) {
        // Redirect to login with return URL
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
        setProgress(90)
        router.push(loginUrl)
      }

      setProgress(100)
      setLoading(false)
    }

    checkAuth()
  }, [pathname, router])

  // Show unified loading screen while checking auth or redirecting
  if (loading || (!PUBLIC_ROUTES.includes(pathname) && !isAuthenticated)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background">
        <div className="flex flex-col items-center gap-6">
          <Image
            src="/atlas_logo_rounded_m.png"
            alt="Atlas Gym Logo"
            width={120}
            height={120}
            priority
            className="animate-pulse"
          />
          <div className="w-64 space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              {progress < 100 ? 'Loading...' : 'Redirecting...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

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
