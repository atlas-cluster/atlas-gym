import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { UserData } from './schemas'
import { apiClient } from './api'

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

      const authenticated = await fetchUser()

      if (!authenticated) {
        // Redirect to login with return URL
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
        router.push(loginUrl)
      }

      setLoading(false)
    }

    checkAuth()
  }, [pathname, router])

  // Show nothing while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
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
