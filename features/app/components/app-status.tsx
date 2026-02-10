import React, { useEffect, useState } from 'react'

import { ping } from '@/features/app/actions/ping'

export function AppStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)

  useEffect(() => {
    ping().then(setIsConnected)
  }, [])

  return (
    <div className={'inline-flex items-center gap-1.5'}>
      <div
        className={`h-2 w-2 rounded-full ${
          isConnected === null
            ? 'bg-ring'
            : isConnected
              ? 'bg-atlas'
              : 'bg-destructive'
        }`}
      />
      <span className="text-muted-foreground text-xs text-nowrap">
        {isConnected === null
          ? 'Connecting...'
          : isConnected
            ? 'Connected'
            : 'Not connected'}
      </span>
    </div>
  )
}
