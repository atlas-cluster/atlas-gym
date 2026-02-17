'use client'
import { SquareTerminalIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { SQLEditorSheet } from '@/features/app/components/sql-editor-sheet'
import { ThemeToggle } from '@/features/app/components/theme-toggle'
import { formatRoute } from '@/features/app/utils/format-route'
import { useAuth } from '@/features/auth'
import { Button } from '@/features/shared/components/ui/button'
import { Separator } from '@/features/shared/components/ui/separator'
import { SidebarTrigger } from '@/features/shared/components/ui/sidebar'

export function AppHeader() {
  const pathname = usePathname()
  const { member } = useAuth()
  const [sqlEditorOpen, setSqlEditorOpen] = useState(false)

  return (
    <div
      className={
        'border-sidebar-border flex h-[49px] w-full items-center border-b px-2'
      }>
      <div className={'mr-auto flex items-center gap-2'}>
        <SidebarTrigger />
        <Separator
          orientation={'vertical'}
          className={'data-[orientation=vertical]:h-6'}
        />
        <h1 className="ml-1 text-base font-semibold">
          {formatRoute(pathname)}
        </h1>
      </div>
      <div className={'ml-auto flex items-center gap-2'}>
        {member?.isTrainer && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Open SQL Editor"
            onClick={() => setSqlEditorOpen(true)}>
            <SquareTerminalIcon />
          </Button>
        )}
        <ThemeToggle />
      </div>

      <SQLEditorSheet open={sqlEditorOpen} onOpenChange={setSqlEditorOpen} />
    </div>
  )
}
