'use client'

import { useEffect } from 'react'

export function SwRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silent — PushToggle will surface 'unsupported' state to the user.
    })
  }, [])
  return null
}
