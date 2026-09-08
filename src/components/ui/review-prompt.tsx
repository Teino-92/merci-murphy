'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

const FIRST_SEEN_KEY = 'mm_first_seen'
const REVIEW_PROMPT_KEY = 'mm_review_prompt'
const COOKIE_CONSENT_KEY = 'mm_cookie_consent'

const GOOGLE_REVIEW_URL =
  process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ?? 'https://g.page/r/CX_sCK3JxpRZEAE/review'

const DELAY_MS = 10_000
// Une vraie deuxième visite, pas un rechargement de page.
// En dev le délai tombe à zéro pour pouvoir tester le modal immédiatement.
const RETURNING_AFTER_MS = process.env.NODE_ENV === 'development' ? 0 : 24 * 60 * 60 * 1000
const SNOOZE_MS = 30 * 24 * 60 * 60 * 1000

// Pages où la demande d'avis serait déplacée ou intrusive.
const EXCLUDED_PREFIXES = ['/studio', '/dashboard', '/compte', '/panier', '/checkout']

type Step = 'ask' | 'thanks'

export function ReviewPrompt() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState<Step>('ask')

  useEffect(() => {
    if (EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return

    let firstSeen: number
    let answered: string | null
    let consent: string | null
    try {
      const stored = localStorage.getItem(FIRST_SEEN_KEY)
      answered = localStorage.getItem(REVIEW_PROMPT_KEY)
      consent = localStorage.getItem(COOKIE_CONSENT_KEY)
      if (!stored) {
        localStorage.setItem(FIRST_SEEN_KEY, String(Date.now()))
        return
      }
      firstSeen = Number(stored)
    } catch {
      return
    }

    if (!Number.isFinite(firstSeen)) return
    // Bannière cookies encore ouverte : deux overlays d'un coup, non.
    if (!consent) return
    if (Date.now() - firstSeen < RETURNING_AFTER_MS) return

    if (answered) {
      if (answered !== 'later') return
      const snoozedAt = Number(localStorage.getItem(`${REVIEW_PROMPT_KEY}_at`))
      if (!Number.isFinite(snoozedAt) || Date.now() - snoozedAt < SNOOZE_MS) return
    }

    const timer = setTimeout(async () => {
      // Un client confirmé n'a pas besoin de la question filtre.
      try {
        const res = await fetch('/api/review-status')
        if (res.ok) {
          const { isClient } = (await res.json()) as { isClient: boolean }
          if (isClient) setStep('thanks')
        }
      } catch {
        // Hors ligne ou route indisponible : on garde la question filtre.
      }
      setVisible(true)
    }, DELAY_MS)
    return () => clearTimeout(timer)
  }, [pathname])

  function remember(value: string) {
    try {
      localStorage.setItem(REVIEW_PROMPT_KEY, value)
      localStorage.setItem(`${REVIEW_PROMPT_KEY}_at`, String(Date.now()))
    } catch {
      // Storage indisponible : on ferme simplement.
    }
  }

  function handleClient() {
    remember('client')
    setStep('thanks')
  }

  function handleNotYet() {
    remember('not_client')
    setVisible(false)
  }

  function handleLater() {
    remember('later')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-prompt-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 px-4 pb-4 sm:items-center sm:pb-0"
      onClick={handleLater}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-cream px-6 py-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'ask' ? (
          <>
            <p
              id="review-prompt-title"
              className="font-display text-lg font-semibold text-charcoal"
            >
              Vous êtes déjà venu chez nous ? 🐾
            </p>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
              Si votre chien a déjà passé un moment chez merci murphy®, votre avis nous aiderait
              beaucoup.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button
                className="bg-terracotta-dark text-white hover:bg-terracotta-dark/90"
                onClick={handleClient}
              >
                Oui, je suis déjà client
              </Button>
              <Button variant="outline" onClick={handleNotYet}>
                Pas encore
              </Button>
            </div>
          </>
        ) : (
          <>
            <p
              id="review-prompt-title"
              className="font-display text-lg font-semibold text-charcoal"
            >
              Merci beaucoup ⭐
            </p>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
              Quelques mots sur Google font une vraie différence pour un petit salon comme le nôtre.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setVisible(false)}
              >
                <Button className="w-full bg-terracotta-dark text-white hover:bg-terracotta-dark/90">
                  Laisser un avis Google
                </Button>
              </a>
              <Button variant="outline" onClick={handleLater}>
                Plus tard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
