import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUserBySessionId } from '@/lib/auth'

export default async function TrainerLayout({
  children,
}: {
  children: React.ReactNode
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
