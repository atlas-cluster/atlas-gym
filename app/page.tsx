'use client'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { useIsMobile } from '@/hooks/use-mobile'
import { ThemeProvider } from '@/components/theme-provider'
import { DbTestCard } from '@/components/db-test-card'

export default function Home() {
  const isMobile = useIsMobile()

  return (
    <ThemeProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className={(!isMobile && 'mr-2') || 'mx-2'}>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
            <DbTestCard />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  )
}
