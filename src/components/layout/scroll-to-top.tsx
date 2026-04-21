'use client'

import { ChevronUp } from 'lucide-react'

export function ScrollToTop() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Retour en haut"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-charcoal/15 hover:bg-charcoal/30 transition-colors"
    >
      <ChevronUp className="h-5 w-5 text-charcoal" />
    </button>
  )
}
