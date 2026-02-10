import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

import { AppHeader, AppSidebar } from '@/features/app'
import { getSession } from '@/features/auth/actions/get-session'
import {
  SidebarInset,
  SidebarProvider,
} from '@/features/shared/components/ui/sidebar'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession()

  if (!session.authenticated) {
    redirect('/auth?session_expired=true')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className={'p-3'}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
