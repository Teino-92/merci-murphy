'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { DisplayTitle } from '@/components/ui/editorial'

const INTRO = 'mt-6 text-lg leading-relaxed text-charcoal/70'

/**
 * Formulaire de contre-proposition de créneau.
 */
export function DeclineForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [counter, setCounter] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const res = await fetch('/api/booking/respond/decline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, counter }),
    })
    setStatus(res.ok ? 'done' : 'error')
  }

  if (status === 'done') {
    return (
      <div className="max-w-xl">
        <DisplayTitle as="h1" size="feature">
          Message envoyé
        </DisplayTitle>
        <p className={INTRO}>
          Nous avons bien reçu votre réponse. L&apos;équipe vous recontactera rapidement.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <DisplayTitle as="h1" size="feature">
        Proposer une autre date
      </DisplayTitle>
      <p className={INTRO}>Indiquez vos disponibilités et nous reviendrons vers vous rapidement.</p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <label htmlFor="counter" className="sr-only">
          Vos disponibilités
        </label>
        <textarea
          id="counter"
          value={counter}
          onChange={(e) => setCounter(e.target.value)}
          placeholder="Ex : je suis disponible le lundi 28 avril après 14h, ou le mercredi matin..."
          rows={5}
          className="w-full resize-none border border-charcoal/20 bg-white px-4 py-3 text-base text-charcoal placeholder:text-charcoal/40 focus:border-charcoal/40 focus:outline-none focus:ring-2 focus:ring-terracotta-dark/40"
        />
        {status === 'error' && (
          <p className="text-sm text-red-500">Une erreur est survenue. Réessayez.</p>
        )}
        <button
          type="submit"
          disabled={status === 'sending' || !counter.trim()}
          className="h-12 w-full bg-terracotta-dark px-8 text-[15px] text-white transition-colors hover:bg-terracotta-dark/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta-dark disabled:opacity-50 sm:w-auto"
        >
          {status === 'sending' ? 'Envoi…' : 'Envoyer ma proposition'}
        </button>
      </form>
    </div>
  )
}
