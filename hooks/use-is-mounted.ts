'use client'

import { useSyncExternalStore } from 'react'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function subscribe(callback: () => void) {
  // This is a no-op for this use case. We're not subscribing to any external store changes.
  return () => {}
}

function getSnapshot() {
  // On the client, we want this to be true.
  return true
}

function getServerSnapshot() {
  // On the server, we want this to be false.
  return false
}

/**
 * A hook to check if the component is mounted on the client.
 * This is useful for avoiding hydration mismatches with client-only components.
 * It returns `false` on the server and `true` on the client after hydration.
 */
export function useIsMounted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
