import { useRef, useState } from 'react'

export function useAsyncAction() {
  const [isPending, setIsPending] = useState(false)
  const pendingRef = useRef(false)

  function start(): boolean {
    if (pendingRef.current) return false
    pendingRef.current = true
    setIsPending(true)
    return true
  }

  function stop(): void {
    pendingRef.current = false
    setIsPending(false)
  }

  return { isPending, start, stop }
}
