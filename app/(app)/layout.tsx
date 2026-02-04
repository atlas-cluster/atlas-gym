import { ReactNode } from 'react'

import { AppHeader, AppSidebar } from '@/features/app'
import {
  SidebarInset,
  SidebarProvider,
} from '@/features/shared/components/ui/sidebar'

export default function AppLayout({ children }: { children: ReactNode }) {
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
