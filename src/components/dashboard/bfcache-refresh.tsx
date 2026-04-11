'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Forces a router refresh when the page is restored from bfcache or the tab
 * becomes visible again (PWA resume, tab switch).
 */
export function BfcacheRefresh() {
  const router = useRouter()

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
