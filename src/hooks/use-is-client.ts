'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/**
 * `false` pendant le SSR et l'hydratation, `true` ensuite côté navigateur.
 * Remplace le pattern `useEffect(() => setMounted(true), [])` pour lire
 * `window` / `localStorage` sans setState dans un effet.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
