'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'mm_cookie_consent'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY)
    if (!consent) {
      setVisible(true)
    } else if (consent === 'accepted') {
      window.gtag?.('consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted' })
    }
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    window.gtag?.('consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted' })
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined')
    window.gtag?.('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied' })
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-2xl bg-charcoal-light px-6 py-5 shadow-2xl sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm reveal-anim"
      style={{ animationPlayState: 'running' }}
    >
      <p className="font-display text-sm font-semibold text-cream">
        merci murphy® utilise des cookies 🍪
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-cream/60">
        Nous utilisons des cookies pour améliorer votre expérience et mesurer l&apos;audience du
        site. Vous pouvez accepter ou refuser.
      </p>
      <div className="mt-4 flex gap-2">
        <Button
          size="sm"
          className="flex-1 bg-terracotta-dark text-white hover:bg-terracotta-dark/90"
          onClick={accept}
        >
          Accepter
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-cream/40 bg-transparent text-cream hover:bg-cream/10"
          onClick={decline}
        >
          Refuser
        </Button>
      </div>
    </div>
  )
}
