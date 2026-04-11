'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Forces a router refresh when the page is restored from the browser's
 * back/forward cache (bfcache). This prevents stale data in the dashboard
 * when navigating back to a page, especially in PWA / standalone mode.
 */
export function BfcacheRefresh() {
  const router = useRouter()

  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) router.refresh()
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [router])

  return null
}
