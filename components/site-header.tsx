'use client'
import { Card } from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { SquareTerminalIcon } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { usePathname } from 'next/navigation'

export function SiteHeader() {
  const pathname = usePathname()

  // Helper to get title from pathname
  const getTitle = (path: string) => {
    const segment = path.split('/')[1]
    if (!segment) return 'Dashboard'
    return segment.charAt(0).toUpperCase() + segment.slice(1)
  }

  return (
    <div
      className={
        'border-sidebar-border flex h-[49px]! w-full items-center border-b px-2'
      }>
      <div className={'mr-auto flex items-center gap-2'}>
        <SidebarTrigger />
        <Separator
          orientation={'vertical'}
          className={'data-[orientation=vertical]:h-6'}
        />
        <h1 className="ml-1 text-base font-semibold">{getTitle(pathname)}</h1>
      </div>
      <div className={'ml-auto flex items-center gap-2'}>
        <Button variant="ghost" size="icon-sm" aria-label="Open SQL Editor">
          <SquareTerminalIcon />
        </Button>
        <ThemeToggle />
      </div>
    </div>
  )
}
