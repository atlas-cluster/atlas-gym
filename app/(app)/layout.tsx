import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className={'mx-2 md:mr-2 md:ml-0'}>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
