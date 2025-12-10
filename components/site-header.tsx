import { Card } from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { SquareTerminalIcon } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export function SiteHeader() {
  return (
    <Card className={'my-2 mr-2 h-13 w-full px-2 py-0'}>
      <div className="flex h-full w-full items-center justify-between">
        <div className={'flex items-center gap-2'}>
          <SidebarTrigger />
          <Separator
            orientation={'vertical'}
            className={'data-[orientation=vertical]:h-12'}
          />
          <h1 className="ml-2 text-base font-medium">Dashboard</h1>
        </div>
        <div className={'flex items-center gap-2'}>
          <Button variant="ghost" size="icon-sm" aria-label="Open SQL Editor">
            <SquareTerminalIcon />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </Card>
  )
}
