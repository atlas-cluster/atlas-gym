import { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCachedUserBySessionId } from '@/lib/auth'

export default async function TrainerLayout({
  children,
}: {
  children: ReactNode
}) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value

  if (!sessionId) {
    redirect('/auth')
  }

  const user = await getCachedUserBySessionId(sessionId)

  if (!user || !user.isTrainer) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
