'use client'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { useIsMobile } from '@/hooks/use-mobile'
import { ThemeProvider } from '@/components/theme-provider'
import { Card } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { CircleAlertIcon } from 'lucide-react'

export default function Home() {
  const isMobile = useIsMobile()

  return (
    <ThemeProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className={(!isMobile && 'mr-2') || 'mx-2'}>
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
    </ThemeProvider>
  )
}
