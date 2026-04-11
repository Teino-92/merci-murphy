'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

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

// day of week: 0=Sun,1=Mon...6=Sat
function getDayOfWeek(dateStr: string): number {
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay()
}

// Return all YYYY-MM-DD dates in a given month (year/month 0-indexed)
function getDatesInMonth(year: number, month: number): string[] {
  const dates: string[] = []
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    dates.push(`${year}-${mm}-${dd}`)
  }
  return dates
}

function monthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month, 1)).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

// ─── MonthCalendar ────────────────────────────────────────────────────────────

interface MonthCalendarProps {
  onSelectDate: (date: string) => void
}

function MonthCalendar({ onSelectDate }: MonthCalendarProps) {
  const today = isoToday()
  const horizon = addDays(today, BOOKING_HORIZON_DAYS)

  const [year, setYear] = useState(() => parseInt(today.slice(0, 4), 10))
  const [month, setMonth] = useState(() => parseInt(today.slice(5, 7), 10) - 1)

  const dates = getDatesInMonth(year, month)

  // First day of month: 0=Sun,1=Mon...6=Sat → we need Mon=0 offset for grid
  const firstDow = getDayOfWeek(dates[0])
  // Convert Sun=0 → 6, Mon=1 → 0, Tue=2 → 1 ...
  const gridOffset = firstDow === 0 ? 6 : firstDow - 1

  const prevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1)
      setMonth(11)
    } else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1)
      setMonth(0)
    } else setMonth((m) => m + 1)
  }

  // Disable prev if current month is today's month
  const todayYear = parseInt(today.slice(0, 4), 10)
  const todayMonth = parseInt(today.slice(5, 7), 10) - 1
  const canGoPrev = year > todayYear || (year === todayYear && month > todayMonth)

  // Disable next if current month is beyond horizon month
  const horizonYear = parseInt(horizon.slice(0, 4), 10)
  const horizonMonth = parseInt(horizon.slice(5, 7), 10) - 1
  const canGoNext = year < horizonYear || (year === horizonYear && month < horizonMonth)

  return (
    <div className="bg-white rounded-2xl border border-[#f0ebe3] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="p-1.5 rounded-lg text-charcoal/40 hover:text-charcoal hover:bg-[#f5f0eb] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-charcoal capitalize">
          {monthLabel(year, month)}
        </span>
        <button
          onClick={nextMonth}
          disabled={!canGoNext}
          className="p-1.5 rounded-lg text-charcoal/40 hover:text-charcoal hover:bg-[#f5f0eb] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold text-charcoal/30 uppercase py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {/* empty cells before first day */}
        {Array.from({ length: gridOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {dates.map((date) => {
          const dow = getDayOfWeek(date)
          const isSunday = dow === 0
          const isPast = date < today
          const isBeyondHorizon = date > horizon
          const disabled = isSunday || isPast || isBeyondHorizon
          const isToday = date === today

          return (
            <button
              key={date}
              onClick={() => !disabled && onSelectDate(date)}
              disabled={disabled}
              className={[
                'flex items-center justify-center h-9 w-full rounded-xl text-sm font-medium transition-colors',
                disabled
                  ? 'text-charcoal/20 cursor-not-allowed'
                  : 'text-charcoal hover:bg-[#B5A89A]/20 cursor-pointer',
                isToday && !disabled ? 'ring-1 ring-[#B5A89A]' : '',
              ].join(' ')}
            >
              {parseInt(date.slice(8), 10)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── SlotPicker ───────────────────────────────────────────────────────────────

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

  // ── Confirmed ────────────────────────────────────────────────────────────────
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

  // ── Service ──────────────────────────────────────────────────────────────────
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

  // ── Date ─────────────────────────────────────────────────────────────────────
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
        <MonthCalendar
          onSelectDate={(date) => {
            setSelectedDate(date)
            setStep('time')
          }}
        />
      </div>
    )
  }

  // ── Time ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setStep('date')
            setSlots([])
            setSlotsError(null)
            setSelectedSlot(null)
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
            </div>
          )}
        </>
      )}
    </div>
  )
}
