import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

import { getSession } from '@/features/auth/actions/get-session'

export default async function TrainerLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getSession()

  // If member is not authenticated or not a trainer, redirect to dashboard
  if (!session.member?.isTrainer) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
