'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { ContrastIcon, MoonIcon, SunIcon } from 'lucide-react'

type Theme = 'light' | 'dark' | 'system'

const NEXT_THEME: Record<Theme, Theme> = {
  light: 'system',
  system: 'dark',
  dark: 'light',
}

const IconSwitcher = React.memo(function IconSwitcher({
  theme,
  baseClass,
}: {
  theme: Theme
  baseClass: string
}) {
  return (
    <span className="relative inline-flex h-5 w-5">
      <SunIcon
        aria-hidden
        className={
          baseClass +
          (theme === 'light'
            ? ' opacity-100'
            : ' pointer-events-none opacity-0')
        }
      />
      <MoonIcon
        aria-hidden
        className={
          baseClass +
          (theme === 'dark' ? ' opacity-100' : ' pointer-events-none opacity-0')
        }
      />
      <ContrastIcon
        aria-hidden
        className={
          baseClass +
          (theme === 'system'
            ? ' opacity-100'
            : ' pointer-events-none opacity-0')
        }
      />
    </span>
  )
})

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  // Use 'system' as default for SSR to avoid hydration mismatch
  const currentTheme = mounted ? ((theme ?? resolvedTheme ?? 'system') as Theme) : 'system'

  const toggleTheme = React.useCallback(() => {
    if (!mounted) return
    const next = NEXT_THEME[currentTheme]
    setTheme(next)
  }, [mounted, currentTheme, setTheme])

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label="Toggle theme">
      <IconSwitcher
        theme={currentTheme}
        baseClass="absolute inset-0 m-auto transition-opacity duration-200 ease-in-out motion-reduce:transition-none"
      />
    </Button>
  )
}
