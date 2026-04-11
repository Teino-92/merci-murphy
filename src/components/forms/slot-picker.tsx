'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Scissors,
  Bath,
  Waves,
  HandHeart,
  PawPrint,
  Dices,
  type LucideIcon,
} from 'lucide-react'
import type { Profile } from '@/lib/auth-actions'
import { ONLINE_BOOKABLE, BOOKING_HORIZON_DAYS } from '@/lib/booking-config'
import { SERVICE_LABELS } from '@/lib/dog-constants'

const SERVICE_ICON: Record<string, LucideIcon> = {
  toilettage: Scissors,
  bains: Bath,
  balneo: Waves,
  massage: HandHeart,
  creche: PawPrint,
}

const SERVICE_ANIM: Record<string, string> = {
  toilettage: 'animate-snip',
  bains: 'animate-ripple',
  balneo: 'animate-drip',
  massage: 'animate-pulse_heart',
  creche: 'animate-paw_bounce',
}

interface Slot {
  timeUtc: string
  timeParis: string
  staffId: string
  staffName: string
}

interface CrecheSlot {
  timeUtc: string
  timeParis: string
}

interface Toiletteur {
  id: string
  name: string
  color: string
}

type Step = 'service' | 'staff' | 'creche-duration' | 'date' | 'time' | 'confirmed'

const CRECHE_DURATIONS = [
  { value: 60, label: '1 heure' },
  { value: 120, label: '2 heures' },
  { value: 180, label: '3 heures' },
  { value: 240, label: '4 heures' },
]

const BOOKABLE_SERVICES = (ONLINE_BOOKABLE as readonly string[]).map((slug) => ({
  slug,
  label: SERVICE_LABELS[slug] ?? slug,
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

function getDayOfWeek(dateStr: string): number {
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay()
}

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

function MonthCalendar({
  onSelectDate,
  disableSunday = true,
  disableWeekends = false,
  allowedDows,
}: {
  onSelectDate: (date: string) => void
  disableSunday?: boolean
  disableWeekends?: boolean
  allowedDows?: number[] // e.g. [2,3,4,5] for Tue–Fri
}) {
  const today = isoToday()
  const horizon = addDays(today, BOOKING_HORIZON_DAYS)

  const [year, setYear] = useState(() => parseInt(today.slice(0, 4), 10))
  const [month, setMonth] = useState(() => parseInt(today.slice(5, 7), 10) - 1)

  const dates = getDatesInMonth(year, month)
  const firstDow = getDayOfWeek(dates[0])
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

  const todayYear = parseInt(today.slice(0, 4), 10)
  const todayMonth = parseInt(today.slice(5, 7), 10) - 1
  const canGoPrev = year > todayYear || (year === todayYear && month > todayMonth)

  const horizonYear = parseInt(horizon.slice(0, 4), 10)
  const horizonMonth = parseInt(horizon.slice(5, 7), 10) - 1
  const canGoNext = year < horizonYear || (year === horizonYear && month < horizonMonth)

  return (
    <div className="bg-white rounded-2xl border border-[#f0ebe3] p-5">
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

      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: gridOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {dates.map((date) => {
          const dow = getDayOfWeek(date)
          const isSunday = dow === 0
          const isSaturday = dow === 6
          const isPast = date < today
          const isBeyondHorizon = date > horizon
          const notAllowed = allowedDows ? !allowedDows.includes(dow) : false
          const disabled =
            isPast ||
            isBeyondHorizon ||
            (disableSunday && isSunday) ||
            (disableWeekends && (isSunday || isSaturday)) ||
            notAllowed
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
  const [crecheSlots, setCrecheSlots] = useState<CrecheSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [selectedCrecheSlot, setSelectedCrecheSlot] = useState<CrecheSlot | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [confirmedService, setConfirmedService] = useState<string | null>(null)
  const [confirmedDate, setConfirmedDate] = useState<string | null>(null)
  const [confirmedTime, setConfirmedTime] = useState<string | null>(null)

  // Toiletteur selection state
  const [toiletteurs, setToiletteurs] = useState<Toiletteur[]>([])
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [selectedStaffName, setSelectedStaffName] = useState<string | null>(null)

  // Crèche duration state
  const [crecheDuration, setCrecheDuration] = useState<number | null>(null)

  // Hover animation state for service icons
  const [animatingService, setAnimatingService] = useState<string | null>(null)

  // Load toiletteurs when toilettage is selected
  useEffect(() => {
    if (selectedService === 'toilettage' && toiletteurs.length === 0) {
      fetch('/api/booking/toiletteurs')
        .then((r) => r.json())
        .then((data: Toiletteur[]) => setToiletteurs(data))
        .catch(() => {})
    }
  }, [selectedService, toiletteurs.length])

  const fetchSlots = useCallback(
    async (service: string, date: string, staffId: string | null, durationOverride?: number) => {
      setSlotsLoading(true)
      setSlotsError(null)
      setSlots([])
      setCrecheSlots([])
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
        if (slugBase === 'creche' && durationOverride) {
          url += `&duration=${durationOverride}`
        }
        if (staffId) url += `&staffId=${staffId}`
        const res = await fetch(url)
        const data = await res.json()
        if (!res.ok) {
          setSlotsError(data.error ?? 'Erreur lors du chargement des créneaux.')
        } else {
          if (slugBase === 'creche') {
            setCrecheSlots(data.slots ?? [])
          } else {
            setSlots(data.slots ?? [])
          }
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
      const slugBase = selectedService.split('-')[0]
      fetchSlots(
        selectedService,
        selectedDate,
        selectedStaffId,
        slugBase === 'creche' ? (crecheDuration ?? undefined) : undefined
      )
    }
  }, [step, selectedService, selectedDate, selectedStaffId, crecheDuration, fetchSlots])

  function pickToiletteur(id: string, name: string) {
    setSelectedStaffId(id)
    setSelectedStaffName(name)
    setStep('date')
  }

  function pickRandomToiletteur() {
    if (toiletteurs.length === 0) return
    const t = toiletteurs[Math.floor(Math.random() * toiletteurs.length)]
    pickToiletteur(t.id, t.name)
  }

  async function confirmBooking(timeUtc: string, timeParis: string, staffId?: string) {
    if (!selectedService || !selectedDate) return
    setConfirming(true)
    setConfirmError(null)
    try {
      const slugBase = selectedService.split('-')[0]
      const body: Record<string, unknown> = {
        serviceSlug: slugBase,
        date: selectedDate,
        timeUtc,
        staffId: staffId ?? null,
      }
      if (slugBase === 'toilettage' && profile.grooming_duration) {
        body.duration = profile.grooming_duration
      }
      if (slugBase === 'creche' && crecheDuration) {
        body.duration = crecheDuration
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
        setConfirmedTime(timeParis)
        setStep('confirmed')
      }
    } catch {
      setConfirmError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setConfirming(false)
    }
  }

  function resetAll() {
    setStep('service')
    setSelectedService(null)
    setSelectedDate(null)
    setSlots([])
    setCrecheSlots([])
    setSlotsError(null)
    setSelectedSlot(null)
    setSelectedCrecheSlot(null)
    setSelectedStaffId(null)
    setSelectedStaffName(null)
    setCrecheDuration(null)
    setConfirmedService(null)
    setConfirmedDate(null)
    setConfirmedTime(null)
  }

  // ── Confirmed ────────────────────────────────────────────────────────────────
  if (step === 'confirmed') {
    const durationLabel =
      selectedService?.split('-')[0] === 'creche' && crecheDuration
        ? ` · ${crecheDuration / 60}h`
        : ''
    return (
      <div className="rounded-2xl bg-white border border-[#f0ebe3] p-8 text-center space-y-4">
        <div className="text-4xl">🐾</div>
        <h2 className="font-display text-xl font-bold text-charcoal">Rendez-vous confirmé !</h2>
        <p className="text-sm text-charcoal/60">
          {SERVICE_LABELS[confirmedService?.split('-')[0] ?? ''] ?? confirmedService}
          {durationLabel} · {confirmedDate ? formatDateFr(confirmedDate) : ''} à {confirmedTime}
        </p>
        <p className="text-xs text-charcoal/40">Un email de confirmation vous a été envoyé.</p>
        <button
          onClick={resetAll}
          className="text-xs underline underline-offset-2 text-charcoal/40 hover:text-charcoal transition-colors"
        >
          Prendre un autre rendez-vous
        </button>
      </div>
    )
  }

  // ── Service ──────────────────────────────────────────────────────────────────
  if (step === 'service') {
    const visible = BOOKABLE_SERVICES.filter(
      (s) => !(s.slug === 'creche' && !profile.admission_passed)
    )
    return (
      <div className="space-y-6">
        <p className="text-sm text-charcoal/50 text-center tracking-wide uppercase text-xs font-semibold">
          Choisissez votre service
        </p>
        {(() => {
          const row1 = visible.slice(0, 3)
          const row2 = visible.slice(3)
          const renderBtn = (s: (typeof visible)[0]) => {
            const Icon = SERVICE_ICON[s.slug]
            const anim = SERVICE_ANIM[s.slug] ?? ''
            return (
              <button
                key={s.slug}
                onClick={() => {
                  setSelectedService(s.slug)
                  if (s.slug === 'toilettage') setStep('staff')
                  else if (s.slug === 'creche') setStep('creche-duration')
                  else setStep('date')
                }}
                onMouseEnter={() => setAnimatingService(s.slug)}
                onAnimationEnd={() => setAnimatingService(null)}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-charcoal/10 bg-white px-4 py-6 hover:border-[#B5A89A] hover:shadow-md transition-all"
              >
                <span className="w-14 h-14 rounded-full bg-rose flex items-center justify-center group-hover:bg-rose/70 transition-colors">
                  {Icon && (
                    <Icon
                      className={`h-6 w-6 text-charcoal/60 group-hover:text-charcoal transition-colors ${animatingService === s.slug ? anim : ''}`}
                    />
                  )}
                </span>
                <span className="text-sm font-semibold text-charcoal text-center leading-tight">
                  {s.label}
                </span>
              </button>
            )
          }
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">{row1.map(renderBtn)}</div>
              {row2.length > 0 && (
                <div
                  className={`grid gap-4 ${row2.length === 2 ? 'grid-cols-2 max-w-[calc(66.66%+1rem)] mx-auto' : 'grid-cols-1 max-w-[33.33%] mx-auto'}`}
                >
                  {row2.map(renderBtn)}
                </div>
              )}
            </div>
          )
        })()}
      </div>
    )
  }

  // ── Staff (toilettage only) ───────────────────────────────────────────────────
  if (step === 'staff') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep('service')}
            className="text-xs text-charcoal/40 hover:text-charcoal underline underline-offset-2 transition-colors"
          >
            ← Retour
          </button>
          <p className="text-sm font-semibold text-charcoal flex items-center gap-1.5">
            <Scissors className="h-3.5 w-3.5" /> Toilettage
          </p>
        </div>
        <p className="text-sm text-charcoal/50 text-center tracking-wide uppercase text-xs font-semibold">
          Choisissez votre toiletteur
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {toiletteurs.map((t) => (
            <button
              key={t.id}
              onClick={() => pickToiletteur(t.id, t.name)}
              onMouseEnter={() => setAnimatingService(t.id)}
              onAnimationEnd={() => setAnimatingService(null)}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-charcoal/10 bg-white px-4 py-6 hover:border-[#B5A89A] hover:shadow-md transition-all"
            >
              <span
                className={`w-14 h-14 rounded-full shrink-0 ring-2 ring-white group-hover:ring-[#B5A89A]/30 transition-all ${animatingService === t.id ? 'animate-avatar_wiggle' : ''}`}
                style={{ backgroundColor: t.color }}
              />
              <span className="text-sm font-semibold text-charcoal text-center">{t.name}</span>
            </button>
          ))}
          {toiletteurs.length > 1 && (
            <button
              onClick={pickRandomToiletteur}
              onMouseEnter={() => setAnimatingService('random')}
              onAnimationEnd={() => setAnimatingService(null)}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-charcoal/10 bg-white px-4 py-6 hover:border-[#B5A89A] hover:shadow-md transition-all"
            >
              <span className="w-14 h-14 rounded-full shrink-0 bg-rose flex items-center justify-center group-hover:bg-rose/70 transition-colors">
                <Dices
                  className={`h-6 w-6 text-charcoal/60 group-hover:text-charcoal transition-colors ${animatingService === 'random' ? 'animate-dice_spin' : ''}`}
                />
              </span>
              <div className="text-center">
                <span className="text-sm font-semibold text-charcoal">Au hasard</span>
                <span className="block text-xs text-charcoal/40">On choisit pour vous</span>
              </div>
            </button>
          )}
          {toiletteurs.length === 0 && (
            <p className="text-sm text-charcoal/40 text-center py-4 col-span-full">Chargement…</p>
          )}
        </div>
      </div>
    )
  }

  // ── Crèche duration ───────────────────────────────────────────────────────────
  if (step === 'creche-duration') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep('service')}
            className="text-xs text-charcoal/40 hover:text-charcoal underline underline-offset-2 transition-colors"
          >
            ← Retour
          </button>
          <p className="text-sm font-semibold text-charcoal flex items-center gap-1.5">
            <PawPrint className="h-3.5 w-3.5" /> Crèche
          </p>
        </div>
        <p className="text-sm text-charcoal/50 text-center tracking-wide uppercase text-xs font-semibold">
          Durée souhaitée
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CRECHE_DURATIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => {
                setCrecheDuration(d.value)
                setStep('date')
              }}
              className="group flex flex-col items-center justify-center rounded-2xl border border-charcoal/10 bg-white px-4 py-6 hover:border-[#B5A89A] hover:shadow-md transition-all"
            >
              <span className="text-3xl font-bold text-charcoal group-hover:text-charcoal/80">
                {d.value / 60}h
              </span>
              <span className="text-xs text-charcoal/40 mt-1">{d.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Date ─────────────────────────────────────────────────────────────────────
  if (step === 'date') {
    const isCreche = selectedService?.split('-')[0] === 'creche'
    const backStep =
      selectedService === 'toilettage' ? 'staff' : isCreche ? 'creche-duration' : 'service'
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep(backStep)}
            className="text-xs text-charcoal/40 hover:text-charcoal underline underline-offset-2 transition-colors"
          >
            ← Retour
          </button>
          <p className="text-sm font-semibold text-charcoal flex items-center gap-1.5">
            {(() => {
              const Icon = SERVICE_ICON[selectedService ?? '']
              return Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null
            })()}
            {SERVICE_LABELS[selectedService?.split('-')[0] ?? ''] ?? selectedService}
            {selectedService === 'toilettage' && selectedStaffName ? ` · ${selectedStaffName}` : ''}
            {isCreche && crecheDuration ? ` · ${crecheDuration / 60}h` : ''}
          </p>
        </div>
        <p className="text-sm text-charcoal/60">Choisissez une date</p>
        <MonthCalendar
          onSelectDate={(date) => {
            setSelectedDate(date)
            setStep('time')
          }}
          // Crèche: Tue–Fri only (days 2,3,4,5); Sunday always disabled
          allowedDows={isCreche ? [2, 3, 4, 5] : undefined}
        />
      </div>
    )
  }

  // ── Time ─────────────────────────────────────────────────────────────────────
  const isCreche = selectedService?.split('-')[0] === 'creche'
  const activeSlots = isCreche ? crecheSlots : slots
  const hasSlots = activeSlots.length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setStep('date')
            setSlots([])
            setCrecheSlots([])
            setSlotsError(null)
            setSelectedSlot(null)
            setSelectedCrecheSlot(null)
          }}
          className="text-xs text-charcoal/40 hover:text-charcoal underline underline-offset-2 transition-colors"
        >
          ← Retour
        </button>
        <p className="text-sm font-semibold text-charcoal">
          {selectedDate ? formatDateFr(selectedDate) : ''}
          {selectedService === 'toilettage' && selectedStaffName ? ` · ${selectedStaffName}` : ''}
          {isCreche && crecheDuration ? ` · ${crecheDuration / 60}h` : ''}
        </p>
      </div>

      {slotsLoading && (
        <p className="text-sm text-charcoal/40 text-center py-8">Chargement des créneaux…</p>
      )}

      {slotsError && <p className="text-sm text-red-500 text-center py-4">{slotsError}</p>}

      {!slotsLoading && !slotsError && !hasSlots && (
        <p className="text-sm text-charcoal/40 text-center py-8">
          Aucun créneau disponible ce jour. Choisissez une autre date.
        </p>
      )}

      {!slotsLoading && hasSlots && (
        <>
          <p className="text-sm text-charcoal/60">Choisissez un créneau</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {isCreche
              ? crecheSlots.map((slot) => (
                  <button
                    key={slot.timeUtc}
                    onClick={() => setSelectedCrecheSlot(slot)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                      selectedCrecheSlot?.timeUtc === slot.timeUtc
                        ? 'border-charcoal bg-charcoal text-white'
                        : 'border-charcoal/10 bg-white text-charcoal hover:border-charcoal/30'
                    }`}
                  >
                    {slot.timeParis}
                  </button>
                ))
              : slots.map((slot) => (
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

          {(selectedSlot || selectedCrecheSlot) && (
            <div className="pt-2 space-y-3">
              {confirmError && <p className="text-sm text-red-500 text-center">{confirmError}</p>}
              <button
                onClick={() => {
                  if (isCreche && selectedCrecheSlot) {
                    void confirmBooking(selectedCrecheSlot.timeUtc, selectedCrecheSlot.timeParis)
                  } else if (selectedSlot) {
                    void confirmBooking(
                      selectedSlot.timeUtc,
                      selectedSlot.timeParis,
                      selectedSlot.staffId
                    )
                  }
                }}
                disabled={confirming}
                className="w-full bg-charcoal text-white rounded-full py-3.5 text-sm font-bold hover:bg-charcoal/90 transition-colors disabled:opacity-50"
              >
                {confirming
                  ? 'Confirmation…'
                  : `Confirmer ${isCreche ? selectedCrecheSlot?.timeParis : selectedSlot?.timeParis}`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
