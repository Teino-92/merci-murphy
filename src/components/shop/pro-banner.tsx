'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

const STORAGE_KEY = 'mm-pro-banner-dismissed'
/** Once dismissed, stay quiet for three months. */
const DISMISS_DURATION_MS = 90 * 24 * 60 * 60 * 1000

/**
 * Bottom bar pointing professional visitors to the wholesale page.
 *
 * Deliberately not a modal: an interstitial on a commercial landing page is
 * penalised by Google on mobile, and the overwhelming majority of shop
 * visitors are consumers. This stays out of the way and is dismissible.
 */
export function ProBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw && Date.now() - Number(raw) < DISMISS_DURATION_MS) return
    } catch {
      // Private browsing or blocked storage: show the banner rather than fail.
    }
    // Let the page settle first so the bar never competes with the LCP.
    const timer = window.setTimeout(() => setVisible(true), 2500)
    return () => window.clearTimeout(timer)
  }, [])

  const dismiss = () => {
    setVisible(false)
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()))
    } catch {
      // Nothing to persist to — the banner simply returns next visit.
    }
  }

  if (!visible) return null

  return (
    <div
      role="complementary"
      aria-label="Espace revendeurs"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-charcoal/10 bg-cream/95 backdrop-blur-sm"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
        <p className="min-w-0 flex-1 text-sm text-charcoal/80">
          <span className="font-semibold text-charcoal">Vous êtes un professionnel ?</span>{' '}
          <span className="hidden sm:inline">
            Boutiques, concept-stores et toiletteurs : découvrez nos conditions revendeur.
          </span>
        </p>
        <Link
          href="/revendeurs"
          className="shrink-0 rounded-md bg-charcoal px-4 py-2 text-xs font-semibold text-cream transition-colors hover:bg-charcoal/85 sm:text-sm"
        >
          Voir les tarifs pro
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Masquer"
          className="shrink-0 rounded-md p-1.5 text-charcoal/40 transition-colors hover:bg-charcoal/5 hover:text-charcoal"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
