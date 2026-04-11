'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

/**
 * Forces a router refresh on every internal navigation and when the page
 * becomes visible again (tab switch, PWA resume, bfcache restore).
 * This ensures dashboard data is never served from the client-side router cache.
 */
export function BfcacheRefresh() {
  const router = useRouter()
  const pathname = usePathname()

  // Refresh whenever the route changes (nav between dashboard pages)
  useEffect(() => {
    router.refresh()
  }, [pathname, router])

  // Refresh when tab/app becomes visible again
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') router.refresh()
    }
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) router.refresh()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('pageshow', handlePageShow)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [router])

  return null
}
