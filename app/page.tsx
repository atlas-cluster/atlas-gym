import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { Card } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { CircleAlertIcon } from 'lucide-react'
import { AuthProvider } from '@/components/auth-context'

export default function Home() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className={'mx-2 md:mr-2 md:ml-0'}>
          <SiteHeader />
          <Card className={'mb-2 h-full'}>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CircleAlertIcon />
                </EmptyMedia>
                <EmptyTitle>No Content Available</EmptyTitle>
                <EmptyDescription>
                  There is currently no content to display here. Please check
                  back later or add new content to get started.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </Card>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  )
}
