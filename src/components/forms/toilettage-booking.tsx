'use client'

import { useState } from 'react'
import Cal from '@calcom/embed-react'
import type { Profile } from '@/lib/auth-actions'

const TOILETTEURS = [
  {
    key: 'titouan',
    name: 'Titouan',
    calLink: 'merci-murphy/toilettage-maison-poilus-r-avec-titouan',
  },
  {
    key: 'andrea',
    name: 'Andrea',
    calLink: 'merci-murphy/toilettage-maison-poilus-r-avec-andrea',
  },
] as const

interface ToilettageBookingProps {
  profile: Profile
}

export function ToilettageBooking({ profile }: ToilettageBookingProps) {
  const [selectedLink, setSelectedLink] = useState<string | null>(null)
  const [selectedName, setSelectedName] = useState<string | null>(null)

  function pick(calLink: string, name: string) {
    setSelectedLink(calLink)
    setSelectedName(name)
  }

  function pickRandom() {
    const t = TOILETTEURS[Math.floor(Math.random() * TOILETTEURS.length)]
    setSelectedLink(t.calLink)
    setSelectedName(t.name)
  }

  if (selectedLink) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-charcoal/60">
            Réservation avec <span className="font-semibold text-charcoal">{selectedName}</span>
          </p>
          <button
            onClick={() => {
              setSelectedLink(null)
              setSelectedName(null)
            }}
            className="text-xs text-charcoal/40 hover:text-charcoal underline underline-offset-2 transition-colors"
          >
            Changer
          </button>
        </div>
        <Cal
          calLink={selectedLink}
          config={{
            name: profile.nom,
            ...(profile.grooming_duration ? { duration: String(profile.grooming_duration) } : {}),
          }}
          style={{ width: '100%', height: '650px', border: 'none' }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-charcoal/60 text-center">Choisissez votre toiletteur</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {TOILETTEURS.map((t) => (
          <button
            key={t.key}
            onClick={() => pick(t.calLink, t.name)}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-charcoal/10 bg-white px-6 py-8 text-center hover:border-charcoal/30 hover:shadow-sm transition-all"
          >
            <span className="text-3xl">✂️</span>
            <span className="font-semibold text-charcoal">{t.name}</span>
          </button>
        ))}
        <button
          onClick={pickRandom}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-charcoal/10 bg-white px-6 py-8 text-center hover:border-charcoal/30 hover:shadow-sm transition-all"
        >
          <span className="text-3xl">🎲</span>
          <span className="font-semibold text-charcoal">Au hasard</span>
          <span className="text-xs text-charcoal/40">On choisit pour vous</span>
        </button>
      </div>
    </div>
  )
}
