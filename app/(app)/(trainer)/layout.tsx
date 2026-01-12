import { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUserBySessionId } from '@/app/auth/actions'

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

  const user = await getUserBySessionId(sessionId)

  if (!user || !user.isTrainer) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
