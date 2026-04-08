'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, Clock } from 'lucide-react'
import { SERVICE_LABELS } from '@/lib/dog-constants'

interface CalVisit {
  id: string
  service: string
  date: string
  time: string | null
  staff: string | null
  status: string
  client_nom: string
  nom_chien: string | null
  cal_booking_uid: string | null
}

const STAFF_COLORS: Record<string, string> = {
  Titouan: 'bg-[#1D164E] text-white',
  Andrea: 'bg-[#B85C38] text-white',
}
const DEFAULT_COLOR = 'bg-[#4F6072] text-white'

const HOURS = Array.from({ length: 11 }, (_, i) => i + 9) // 9h → 19h
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

function getMondayOf(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toLocalDateStr(date: Date): string {
  return date.toLocaleDateString('fr-CA') // YYYY-MM-DD
}

function formatHeader(monday: Date): string {
  const sunday = addDays(monday, 5)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
  return `${monday.toLocaleDateString('fr-FR', opts)} — ${sunday.toLocaleDateString('fr-FR', { ...opts, year: 'numeric' })}`
}

export function CalendarView() {
  const [monday, setMonday] = useState<Date>(() => getMondayOf(new Date()))
  const [visits, setVisits] = useState<CalVisit[]>([])
  const [loading, setLoading] = useState(true)

  // Reschedule modal state
  const [rescheduling, setRescheduling] = useState<CalVisit | null>(null)
  const [newDatetime, setNewDatetime] = useState('')
  const [saving, setSaving] = useState(false)
  const [rescheduleError, setRescheduleError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const from = toLocalDateStr(monday)
    const to = toLocalDateStr(addDays(monday, 5))
    fetch(`/api/dashboard/calendar?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((data) => {
        setVisits(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [monday])

  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(monday, i))
  const today = toLocalDateStr(new Date())

  function getVisitsAt(day: Date, hour: number): CalVisit[] {
    const dateStr = toLocalDateStr(day)
    return visits.filter((v) => {
      if (v.date !== dateStr) return false
      if (!v.time) return hour === 9
      const h = parseInt(v.time.slice(0, 2), 10)
      return h === hour
    })
  }

  function openReschedule(v: CalVisit) {
    // Pre-fill with current date/time
    const current = `${v.date}T${v.time ?? '09:00'}`
    setNewDatetime(current)
    setRescheduleError(null)
    setRescheduling(v)
  }

  async function submitReschedule() {
    if (!rescheduling || !newDatetime) return
    setSaving(true)
    setRescheduleError(null)

    // Convert local datetime-local value to UTC ISO string
    const localDate = new Date(newDatetime)
    const res = await fetch(`/api/dashboard/visits/${rescheduling.id}/reschedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newStart: localDate.toISOString() }),
    })
    const json = await res.json()

    if (!res.ok) {
      setRescheduleError(json.error ?? 'Erreur')
      setSaving(false)
      return
    }

    // Update local state
    setVisits((prev) =>
      prev.map((v) => (v.id === rescheduling.id ? { ...v, date: json.date, time: json.time } : v))
    )
    setSaving(false)
    setRescheduling(null)
  }

  return (
    <div>
      {/* Reschedule modal */}
      {rescheduling && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setRescheduling(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1D164E]">Déplacer le rendez-vous</h2>
              <button
                onClick={() => setRescheduling(null)}
                className="text-gray-400 hover:text-[#1D164E]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {rescheduling.nom_chien ?? rescheduling.client_nom} —{' '}
              {SERVICE_LABELS[rescheduling.service] ?? rescheduling.service}
              {rescheduling.staff ? ` · ${rescheduling.staff}` : ''}
            </p>
            {!rescheduling.cal_booking_uid ? (
              <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
                Ce rendez-vous n&apos;a pas de UID cal.com — il a été créé manuellement et ne peut
                pas être déplacé via l&apos;API.
              </p>
            ) : (
              <>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Nouvelle date et heure
                </label>
                <input
                  type="datetime-local"
                  value={newDatetime}
                  onChange={(e) => setNewDatetime(e.target.value)}
                  className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D164E] mb-4"
                />
                {rescheduleError && <p className="text-sm text-red-500 mb-3">{rescheduleError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={submitReschedule}
                    disabled={saving || !newDatetime}
                    className="flex-1 bg-[#1D164E] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#1D164E]/90 disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Déplacement…' : 'Confirmer'}
                  </button>
                  <button
                    onClick={() => setRescheduling(null)}
                    className="px-4 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setMonday((m) => addDays(m, -7))}
          className="p-2 rounded-lg hover:bg-white transition-colors text-[#1D164E]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-[#1D164E] flex-1 text-center">
          {formatHeader(monday)}
        </span>
        <button
          onClick={() => setMonday((m) => addDays(m, 7))}
          className="p-2 rounded-lg hover:bg-white transition-colors text-[#1D164E]"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <button
          onClick={() => setMonday(getMondayOf(new Date()))}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#1D164E] text-[#1D164E] hover:bg-[#1D164E] hover:text-white transition-colors"
        >
          {"Aujourd'hui"}
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#1D164E]" /> Titouan
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#B85C38]" /> Andrea
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#4F6072]" /> Autre
        </span>
      </div>

      {/* Grid */}
      <div
        className={`bg-white rounded-2xl shadow-sm overflow-auto transition-opacity ${loading ? 'opacity-50' : ''}`}
      >
        <table className="w-full border-collapse text-xs" style={{ minWidth: 640 }}>
          <thead>
            <tr>
              <th className="w-12 border-b border-r border-gray-100 py-3 text-gray-400 font-normal" />
              {weekDays.map((day, i) => {
                const dateStr = toLocalDateStr(day)
                const isToday = dateStr === today
                return (
                  <th
                    key={i}
                    className={`border-b border-gray-100 py-3 px-2 font-medium text-center ${isToday ? 'text-[#B85C38]' : 'text-[#1D164E]'}`}
                  >
                    <div>{DAYS[i]}</div>
                    <div className={`text-lg font-bold ${isToday ? 'text-[#B85C38]' : ''}`}>
                      {day.getDate()}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour} className="border-b border-gray-50">
                <td className="border-r border-gray-100 py-2 px-2 text-gray-300 text-right align-top whitespace-nowrap">
                  {hour}h
                </td>
                {weekDays.map((day, di) => {
                  const slot = getVisitsAt(day, hour)
                  return (
                    <td key={di} className="align-top p-1" style={{ minWidth: 90 }}>
                      {slot.map((v) => (
                        <div
                          key={v.id}
                          className={`rounded-lg px-2 py-1.5 mb-1 group relative ${STAFF_COLORS[v.staff ?? ''] ?? DEFAULT_COLOR}`}
                          title={`${v.client_nom}${v.nom_chien ? ` — ${v.nom_chien}` : ''} · ${SERVICE_LABELS[v.service] ?? v.service}`}
                        >
                          <p className="font-semibold truncate leading-tight">
                            {v.nom_chien ?? v.client_nom}
                          </p>
                          <p className="opacity-80 truncate leading-tight">
                            {SERVICE_LABELS[v.service] ?? v.service}
                            {v.staff ? ` · ${v.staff}` : ''}
                          </p>
                          <button
                            onClick={() => openReschedule(v)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/40 rounded p-0.5"
                            title="Déplacer"
                          >
                            <Clock className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
