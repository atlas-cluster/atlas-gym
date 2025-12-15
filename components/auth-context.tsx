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
    } catch (err) {
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
    let progressInterval: NodeJS.Timeout | null = null

    // Separated progress animation utility - can be reused for different scenarios
    const animateProgress = (
      startValue: number,
      targetValue: number,
      duration: number
    ): Promise<void> => {
      return new Promise((resolve) => {
        const steps = Math.ceil(duration / 30) // 30ms per step
        const increment = (targetValue - startValue) / steps
        let currentStep = 0
        let currentValue = startValue

        const interval = setInterval(() => {
          if (!isMounted) {
            clearInterval(interval)
            resolve()
            return
          }

          currentStep++
          currentValue = Math.min(startValue + increment * currentStep, targetValue)
          setProgress(Math.round(currentValue))

          if (currentStep >= steps) {
            clearInterval(interval)
            resolve()
          }
        }, 30)
      })
    }

    const checkAuth = async () => {
      if (PUBLIC_ROUTES.includes(pathname)) {
        setLoading(false)
        return
      }

      // Quick check: if no session cookie exists, show smooth redirect animation
      const hasSessionCookie = document.cookie
        .split('; ')
        .some((cookie) => cookie.startsWith('session='))

      if (!hasSessionCookie) {
        // No cookie - animate progress while redirecting
        await animateProgress(0, 100, 400)
        if (isMounted) {
          setLoading(false)
          const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
          router.push(loginUrl)
        }
        return
      }

      // Has cookie - validate session with progress animation
      // Start progress animation to 60%
      const progressPromise = animateProgress(0, 60, 800)
      const authPromise = fetchUser()

      // Wait for both to complete
      const [, authenticated] = await Promise.all([progressPromise, authPromise])

      if (!isMounted) return

      if (!authenticated) {
        // Invalid session - animate to 100% and redirect
        await animateProgress(60, 100, 400)
        if (isMounted) {
          setLoading(false)
          const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
          router.push(loginUrl)
        }
      } else {
        // Valid session - complete progress and show content
        await animateProgress(60, 100, 400)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
      if (progressInterval) clearInterval(progressInterval)
    }
  }, [pathname, router])

  // Show unified loading screen while checking auth or redirecting
  if (loading || (!PUBLIC_ROUTES.includes(pathname) && !isAuthenticated)) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-6">
          <Image
            src="/atlas_logo_rounded_m.png"
            alt="Atlas Gym Logo"
            width={120}
            height={120}
            priority
            className="animate-pulse"
          />
          <div className="w-64">
            <Progress value={progress} className="h-2" />
          </div>
          <span className={'text-muted-foreground'}>Loading...</span>
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
