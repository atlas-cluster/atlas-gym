'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      // Public routes that don't require authentication
      const publicRoutes = ['/login', '/register']
      
      if (publicRoutes.includes(pathname)) {
        setIsAuthenticated(true)
        return
      }

      try {
        const response = await fetch('/api/auth/session')
        
        if (!response.ok) {
          // API error, redirect to login
          const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
          router.push(loginUrl)
          return
        }
        
        const data = await response.json()

        if (data.authenticated) {
          setIsAuthenticated(true)
        } else {
          // Redirect to login with return URL
          const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
          router.push(loginUrl)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Redirect to login on error
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
        router.push(loginUrl)
      }
    }

    checkAuth()
  }, [pathname, router])

  // Show nothing while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
}
