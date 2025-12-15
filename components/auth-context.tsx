'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react'
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

  // Refs for smooth progress animation (disconnected from auth logic)
  const progressRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)
  const authCompleteRef = useRef(false)

  // Smooth progress animation using requestAnimationFrame
  // This runs independently of auth logic for smooth visuals
  const startProgressAnimation = useCallback(() => {
    progressRef.current = 0
    authCompleteRef.current = false
    setProgress(0)

    const animate = () => {
      if (!authCompleteRef.current) {
        // Animate smoothly toward 90% while waiting for auth
        // Uses easing to slow down as it approaches 90%
        const target = 90
        const remaining = target - progressRef.current
        const increment = remaining * 0.05 // Ease out effect
        progressRef.current = Math.min(
          progressRef.current + Math.max(increment, 0.5),
          target
        )
        setProgress(Math.round(progressRef.current))
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        // Auth complete - quickly animate to 100%
        if (progressRef.current < 100) {
          progressRef.current = Math.min(progressRef.current + 5, 100)
          setProgress(Math.round(progressRef.current))
          if (progressRef.current < 100) {
            animationFrameRef.current = requestAnimationFrame(animate)
          } else {
            // Clear ref when animation completes
            animationFrameRef.current = null
          }
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)
  }, [])

  const stopProgressAnimation = useCallback(() => {
    authCompleteRef.current = true
    // Let the animation naturally complete to 100%
  }, [])

  const fetchUser = useCallback(async () => {
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
      setUser(null)
      setIsAuthenticated(false)
      return false
    }
  }, [])

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch {
      // Even if logout API fails, clear local state
    }
    setUser(null)
    setIsAuthenticated(false)
    router.push('/login')
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      // On public routes - no loading screen needed
      if (PUBLIC_ROUTES.includes(pathname)) {
        if (isMounted) {
          setLoading(false)
        }
        return
      }

      // On protected routes - check for session cookie first
      // Note: This runs in useEffect which only runs client-side, so document is safe to access
      const hasSessionCookie = document.cookie
        .split('; ')
        .some((cookie) => cookie.startsWith('session='))

      if (!hasSessionCookie) {
        // No cookie - redirect to login immediately (no loading screen needed)
        if (isMounted) {
          setLoading(false)
          const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
          router.replace(loginUrl)
        }
        return
      }

      // Has cookie - show loading screen and validate session
      if (!isMounted) return

      // Start smooth progress animation
      startProgressAnimation()

      const authenticated = await fetchUser()

      if (!isMounted) return

      // Signal animation to complete to 100%
      stopProgressAnimation()

      if (!authenticated) {
        // Session invalid - wait for animation then redirect
        const waitAndRedirect = () => {
          if (progressRef.current >= 100) {
            if (isMounted) {
              const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
              router.replace(loginUrl)
            }
          } else {
            requestAnimationFrame(waitAndRedirect)
          }
        }
        waitAndRedirect()
      } else {
        // Authenticated - wait for animation then show content
        const waitForProgress = () => {
          if (progressRef.current >= 100) {
            if (isMounted) {
              setLoading(false)
            }
          } else {
            requestAnimationFrame(waitForProgress)
          }
        }
        waitForProgress()
      }
    }

    checkAuth()

    return () => {
      isMounted = false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [pathname, router, startProgressAnimation, stopProgressAnimation, fetchUser])

  // Show loading screen while checking auth on protected routes
  if (loading && !PUBLIC_ROUTES.includes(pathname)) {
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
