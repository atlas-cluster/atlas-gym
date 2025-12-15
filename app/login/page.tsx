'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LoginForm } from '@/components/login-form'
import { apiClient } from '@/lib/api'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = (await apiClient.getSession()) as {
          authenticated: boolean
        }
        if (data.authenticated) {
          router.push('/')
        }
      } catch {
        // User is not authenticated, stay on login page
      }
    }
    checkSession()
  }, [router])

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-2">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <Image
          src={'/atlas_logo_rounded_m.png'}
          width={100}
          height={100}
          alt={'Logo'}
        />
        <LoginForm className="w-full" />
      </div>
    </div>
  )
}
