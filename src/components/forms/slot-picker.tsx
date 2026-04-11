'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Profile } from '@/lib/auth-actions'
import { ONLINE_BOOKABLE, BOOKING_HORIZON_DAYS } from '@/lib/booking-config'
import { SERVICE_LABELS, SERVICE_EMOJI } from '@/lib/dog-constants'

interface Slot {
  timeUtc: string
  timeParis: string
  staffId: string
  staffName: string
}

type Step = 'service' | 'date' | 'time' | 'confirmed'

const BOOKABLE_SERVICES = (ONLINE_BOOKABLE as readonly string[]).map((slug) => ({
  slug,
  label: SERVICE_LABELS[slug] ?? slug,
  emoji: SERVICE_EMOJI[slug] ?? '📋',
}))

function isoToday(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' })
}

function formatDateFr(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Paris',
  })
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function getDayOfWeek(dateStr: string): number {
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay()
}

// Generate the next N available dates (skip Sundays, limit to horizon)
function getSelectableDates(): string[] {
  const dates: string[] = []
  let cursor = isoToday()
  const horizon = addDays(cursor, BOOKING_HORIZON_DAYS)
  while (cursor <= horizon && dates.length < 60) {
    const dow = getDayOfWeek(cursor)
    if (dow !== 0) dates.push(cursor) // skip Sundays
    cursor = addDays(cursor, 1)
  }
  return dates
}

export function SlotPicker({ profile }: { profile: Profile }) {
  const [step, setStep] = useState<Step>('service')
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [confirmedService, setConfirmedService] = useState<string | null>(null)
  const [confirmedDate, setConfirmedDate] = useState<string | null>(null)
  const [confirmedTime, setConfirmedTime] = useState<string | null>(null)

  const selectableDates = getSelectableDates()

  const fetchSlots = useCallback(
    async (service: string, date: string) => {
      setSlotsLoading(true)
      setSlotsError(null)
      setSlots([])
      try {
        const slugBase = service.split('-')[0]
        let url = `/api/booking/slots?service=${slugBase}&date=${date}`
        if (slugBase === 'toilettage') {
          if (!profile.grooming_duration) {
            setSlotsError("Votre durée de toilettage n'est pas encore définie. Contactez-nous.")
            setSlotsLoading(false)
            return
          }
          url += `&duration=${profile.grooming_duration}`
        }
        const res = await fetch(url)
        const data = await res.json()
        if (!res.ok) {
          setSlotsError(data.error ?? 'Erreur lors du chargement des créneaux.')
        } else {
          setSlots(data.slots ?? [])
        }
      } catch {
        setSlotsError('Erreur réseau. Veuillez réessayer.')
      } finally {
        setSlotsLoading(false)
      }
    },
    [profile.grooming_duration]
  )

  useEffect(() => {
    if (step === 'time' && selectedService && selectedDate) {
      fetchSlots(selectedService, selectedDate)
    }
  }, [step, selectedService, selectedDate, fetchSlots])

  async function confirmBooking(slot: Slot) {
    if (!selectedService || !selectedDate) return
    setConfirming(true)
    setConfirmError(null)
    try {
      const slugBase = selectedService.split('-')[0]
      const body: Record<string, unknown> = {
        serviceSlug: slugBase,
        date: selectedDate,
        timeUtc: slot.timeUtc,
        staffId: slot.staffId,
      }
      if (slugBase === 'toilettage' && profile.grooming_duration) {
        body.duration = profile.grooming_duration
      }
      const res = await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setConfirmError(data.error ?? 'Erreur lors de la confirmation.')
      } else {
        setConfirmedService(selectedService)
        setConfirmedDate(selectedDate)
        setConfirmedTime(slot.timeParis)
        setStep('confirmed')
      }
    } catch {
      setConfirmError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setConfirming(false)
    }
  }

  // ── Step: Confirmed ──────────────────────────────────────────────────────────
  if (step === 'confirmed') {
    return (
      <div className="rounded-2xl bg-white border border-[#f0ebe3] p-8 text-center space-y-4">
        <div className="text-4xl">🐾</div>
        <h2 className="font-display text-xl font-bold text-charcoal">Rendez-vous confirmé !</h2>
        <p className="text-sm text-charcoal/60">
          {SERVICE_LABELS[confirmedService?.split('-')[0] ?? ''] ?? confirmedService} ·{' '}
          {confirmedDate ? formatDateFr(confirmedDate) : ''} à {confirmedTime}
        </p>
        <p className="text-xs text-charcoal/40">Un email de confirmation vous a été envoyé.</p>
        <button
          onClick={() => {
            setStep('service')
            setSelectedService(null)
            setSelectedDate(null)
            setSelectedSlot(null)
            setConfirmedService(null)
            setConfirmedDate(null)
            setConfirmedTime(null)
          }}
          className="text-xs underline underline-offset-2 text-charcoal/40 hover:text-charcoal transition-colors"
        >
          Prendre un autre rendez-vous
        </button>
      </div>
    )
  }

  // ── Step 1: Service ──────────────────────────────────────────────────────────
  if (step === 'service') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-charcoal/60 text-center">Choisissez votre service</p>
        <div className="grid grid-cols-1 gap-3">
          {BOOKABLE_SERVICES.map((s) => (
            <button
              key={s.slug}
              onClick={() => {
                setSelectedService(s.slug)
                setStep('date')
              }}
              className="flex items-center gap-4 rounded-2xl border border-charcoal/10 bg-white px-5 py-4 text-left hover:border-charcoal/30 hover:shadow-sm transition-all"
            >
              <span className="text-2xl shrink-0">{s.emoji}</span>
              <span className="font-semibold text-charcoal">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Step 2: Date ─────────────────────────────────────────────────────────────
  if (step === 'date') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep('service')}
            className="text-xs text-charcoal/40 hover:text-charcoal underline underline-offset-2 transition-colors"
          >
            ← Retour
          </button>
          <p className="text-sm font-semibold text-charcoal">
            {SERVICE_EMOJI[selectedService ?? ''] ?? ''}{' '}
            {SERVICE_LABELS[selectedService?.split('-')[0] ?? ''] ?? selectedService}
          </p>
        </div>
        <p className="text-sm text-charcoal/60">Choisissez une date</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {selectableDates.map((date) => (
            <button
              key={date}
              onClick={() => {
                setSelectedDate(date)
                setStep('time')
              }}
              className="rounded-xl border border-charcoal/10 bg-white px-3 py-3 text-sm text-center hover:border-charcoal/30 hover:shadow-sm transition-all"
            >
              <span className="block text-xs text-charcoal/40 capitalize">
                {new Date(`${date}T12:00:00Z`).toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  timeZone: 'Europe/Paris',
                })}
              </span>
              <span className="font-semibold text-charcoal">
                {new Date(`${date}T12:00:00Z`).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  timeZone: 'Europe/Paris',
                })}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Step 3: Time ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setStep('date')
            setSlots([])
            setSlotsError(null)
          }}
          className="text-xs text-charcoal/40 hover:text-charcoal underline underline-offset-2 transition-colors"
        >
          ← Retour
        </button>
        <p className="text-sm font-semibold text-charcoal">
          {selectedDate ? formatDateFr(selectedDate) : ''}
        </p>
      </div>

      {slotsLoading && (
        <p className="text-sm text-charcoal/40 text-center py-8">Chargement des créneaux…</p>
      )}

      {slotsError && <p className="text-sm text-red-500 text-center py-4">{slotsError}</p>}

      {!slotsLoading && !slotsError && slots.length === 0 && (
        <p className="text-sm text-charcoal/40 text-center py-8">
          Aucun créneau disponible ce jour. Choisissez une autre date.
        </p>
      )}

      {!slotsLoading && slots.length > 0 && (
        <>
          <p className="text-sm text-charcoal/60">Choisissez un créneau</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => (
              <button
                key={slot.timeUtc}
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                  selectedSlot?.timeUtc === slot.timeUtc
                    ? 'border-charcoal bg-charcoal text-white'
                    : 'border-charcoal/10 bg-white text-charcoal hover:border-charcoal/30'
                }`}
              >
                {slot.timeParis}
              </button>
            ))}
          </div>

          {selectedSlot && (
            <div className="pt-2 space-y-3">
              {confirmError && <p className="text-sm text-red-500 text-center">{confirmError}</p>}
              <button
                onClick={() => confirmBooking(selectedSlot)}
                disabled={confirming}
                className="w-full bg-charcoal text-white rounded-full py-3.5 text-sm font-bold hover:bg-charcoal/90 transition-colors disabled:opacity-50"
              >
                {confirming ? 'Confirmation…' : `Confirmer ${selectedSlot.timeParis}`}
              </button>
              <p className="text-xs text-charcoal/40 text-center">avec {selectedSlot.staffName}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
