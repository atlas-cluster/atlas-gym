'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { createContext, useContext, useEffect, useState } from 'react'

import { getSession } from '@/features/auth/actions/get-session'
import { logout as logoutAction } from '@/features/auth/actions/logout'
import { Member } from '@/features/members'

interface AuthContextType {
  member: Member | null
  loading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  refreshMember: () => Promise<void>
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
  initialMember?: Member | null
}

export function AuthProvider({ children, initialMember }: AuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [member, setMember] = useState<Member | null>(initialMember || null)
  const [loading, setLoading] = useState(!initialMember)
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialMember)

  // Explicitly handle session expiration cleanup
  useEffect(() => {
    if (searchParams.get('session_expired') === 'true') {
      const cleanup = async () => {
        // Middleware already clears the cookie when session_expired=true is present
        setMember(null)
        setIsAuthenticated(false)
        router.replace('/auth')
      }
      cleanup()
    }
  }, [searchParams, router])

  const fetchMember = async () => {
    try {
      const data = await getSession()

      if (data.authenticated && data.member) {
        setMember(data.member)
        setIsAuthenticated(true)
        return data.member
      } else {
        setMember(null)
        setIsAuthenticated(false)
        return null
      }
    } catch {
      setMember(null)
      setIsAuthenticated(false)
      return null
    }
  }

  const logout = async () => {
    try {
      await logoutAction()
      setMember(null)
      setIsAuthenticated(false)
      router.push('/auth')
    } catch {
      // Even if logout API fails, clear local state
      setMember(null)
      setIsAuthenticated(false)
      router.push('/auth')
    }
  }

  const refreshMember = async () => {
    await fetchMember()
  }

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      // For public route, just mark as not loading
      if (pathname === AUTH_ROUTE) {
        setLoading(false)
        return
      }

      // If we already have a member (hydrated from server), we can skip the fetch
      // unless we want to force re-verification.
      // Since AppLayout (Server) validates every page load/nav, we can trust the initial value or existing state
      // for the current view.
      if (member) {
        setLoading(false)
        return
      }

      // For protected routes, validate session with server if we don't have a member
      const currentMember = await fetchMember()

      if (!isMounted) return

      // If session is invalid, redirect to login
      if (!currentMember) {
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
    // We add 'member' to dependency so if it changes (e.g. logout) we re-eval?
    // Actually, we want to run this mostly on mount or path change.
    // If we add 'member', and 'fetchMember' sets member, we might loop if we are not careful.
    // But we check `if (member) return`. So if member is set, we stop.
  }, [pathname, router, member])

  // Always render children - no loading screen
  return (
    <AuthContext.Provider
      value={{
        member,
        loading,
        isAuthenticated,
        logout,
        refreshMember,
      }}>
      {children}
    </AuthContext.Provider>
  )
}
