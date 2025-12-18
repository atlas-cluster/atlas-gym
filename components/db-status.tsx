
'use client'
import { useEffect, useState } from 'react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'

type PingResult = {
  success: boolean
  message: string
  details?: unknown
}

function getVersion(details: unknown): string | undefined {
  if (!details || typeof details !== 'object') return undefined
  if ('version' in details) {
    const maybe = (details as { version?: unknown }).version
    if (typeof maybe === 'string') return maybe
    if (maybe !== undefined) return String(maybe)
  }
  return undefined
}

function getUptime(details: unknown): Date | undefined {
  if (!details || typeof details !== 'object') return undefined
  if ('uptime' in details) {
    const maybe = (details as { uptime?: unknown }).uptime
    if (maybe instanceof Date) return maybe
    if (typeof maybe === 'string') return new Date(maybe)
  }
  return undefined
}

function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / (3600 * 24))
  const hours = Math.floor((seconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  let duration = ''
  if (days > 0) duration += `${days}d `
  if (hours > 0) duration += `${hours}h `
  if (minutes > 0) duration += `${minutes}m `

  return duration.trim()
}

export function DbStatus() {
  const [dbConnected, setDbConnected] = useState<boolean | null>(null)
  const [result, setResult] = useState<PingResult | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health')
        const data = (await response.json()) as PingResult
        setResult(data)
        setDbConnected(Boolean(data.success))
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error'
        setDbConnected(false)
        setResult({
          success: false,
          message: errMsg,
          details: error,
        })
      }
    }

    checkConnection()
  }, [])

  const pgVersion = getVersion(result?.details)
  const uptime = getUptime(result?.details)
  const uptimeDuration = uptime
    ? formatDuration((new Date().getTime() - uptime.getTime()) / 1000)
    : undefined

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className={'inline-flex items-center gap-1.5'}>
          <div
            className={`h-2 w-2 cursor-pointer rounded-full ${
              dbConnected === null
                ? 'bg-ring'
                : dbConnected
                  ? 'bg-atlas'
                  : 'bg-destructive'
            }`}
          />
          <span className="text-muted-foreground cursor-pointer truncate text-xs">
            {dbConnected === null
              ? 'Connecting...'
              : dbConnected
                ? 'Connected'
                : 'Not connected'}
          </span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className={'w-80'}>
        {dbConnected === null ? (
          <span className="text-muted-foreground text-xs">
            Connecting to database...
          </span>
        ) : dbConnected ? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">
              Connection successful
            </h4>
            <div className="text-xs">
              <span className="font-semibold">Version:</span>{' '}
              <span>{pgVersion}</span>
            </div>
            {uptimeDuration && (
              <div className="text-xs">
                <span className="font-semibold">Uptime:</span>{' '}
                <span>{uptimeDuration}</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <span className="text-destructive font-semibold">
              Error
            </span>
            <div className="text-muted-foreground mt-1 text-xs">
              {result?.message}
            </div>
          </>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}
