'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function DeclineForm() {
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
      <div className="text-center">
        <p className="text-5xl mb-6">💌</p>
        <h1 className="font-display text-3xl font-bold text-charcoal mb-4">Message envoyé</h1>
        <p className="text-charcoal/60">
          Nous avons bien reçu votre réponse. L&apos;équipe vous recontactera rapidement.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full">
      <p className="text-4xl mb-6 text-center">📅</p>
      <h1 className="font-display text-3xl font-bold text-charcoal mb-2 text-center">
        Proposer une autre date
      </h1>
      <p className="text-charcoal/60 text-center mb-8">
        Indiquez vos disponibilités et nous reviendrons vers vous rapidement.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={counter}
          onChange={(e) => setCounter(e.target.value)}
          placeholder="Ex : je suis disponible le lundi 28 avril après 14h, ou le mercredi matin..."
          rows={5}
          className="w-full rounded-2xl border border-charcoal/20 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-terracotta resize-none"
        />
        {status === 'error' && (
          <p className="text-sm text-red-500">Une erreur est survenue. Réessayez.</p>
        )}
        <button
          type="submit"
          disabled={status === 'sending' || !counter.trim()}
          className="w-full rounded-full bg-charcoal py-3 text-sm font-semibold text-cream disabled:opacity-50 transition-opacity"
        >
          {status === 'sending' ? 'Envoi…' : 'Envoyer ma proposition'}
        </button>
      </form>
    </div>
  )
}

export default function DeclinePage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <Suspense>
        <DeclineForm />
      </Suspense>
    </div>
  )
}
