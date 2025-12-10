'use client'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { useIsMobile } from '@/hooks/use-mobile'
import { ThemeProvider } from '@/components/theme-provider'
import { DatabaseStatus } from '@/components/database-status'

export default function Home() {
  const isMobile = useIsMobile()

  return (
    <ThemeProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className={(!isMobile && 'mr-2') || 'mx-2'}>
          <SiteHeader />
            <DatabaseStatus />
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  )
}
