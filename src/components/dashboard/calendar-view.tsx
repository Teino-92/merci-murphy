'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, Clock, Dog } from 'lucide-react'
import { SERVICE_LABELS } from '@/lib/dog-constants'

interface CalVisit {
  id: string
  service: string
  date: string
  time: string | null
  staff: string | null
  staff_color: string
  status: string
  client_nom: string
  nom_chien: string | null
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8h → 20h
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

// ─── Service groups ───────────────────────────────────────────────────────────

const SPA_TABS = [
  { slug: 'toilettage', label: 'Toilettage', showStaff: true },
  { slug: 'bains', label: 'Bains', showStaff: false },
  { slug: 'balneo', label: 'Balnéo', showStaff: false },
]

const BIENETRE_TABS = [
  { slug: 'massage', label: 'Massage', showStaff: false },
  { slug: 'osteo', label: 'Ostéopathie', showStaff: false },
]

const CRECHE_EDUCATION_TABS = [
  { slug: 'creche', label: 'Crèche', showStaff: false },
  { slug: 'education', label: 'Éducation', showStaff: false },
]

// ─── Date helpers ─────────────────────────────────────────────────────────────

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
  const saturday = addDays(monday, 5)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
  return `${monday.toLocaleDateString('fr-FR', opts)} — ${saturday.toLocaleDateString('fr-FR', { ...opts, year: 'numeric' })}`
}

function getParisHour(dateStr: string, timeStr: string | null): number {
  if (!timeStr) return 9
  const dt = new Date(`${dateStr}T${timeStr.slice(0, 5)}Z`)
  return parseInt(
    dt.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'Europe/Paris' }),
    10
  )
}

// ─── RescheduleModal ──────────────────────────────────────────────────────────

interface RescheduleModalProps {
  visit: CalVisit
  onClose: () => void
  onSaved: (id: string, date: string, time: string) => void
  onDeleted: (id: string) => void
}

function RescheduleModal({ visit, onClose, onSaved, onDeleted }: RescheduleModalProps) {
  const utcStr = visit.time ? `${visit.date}T${visit.time.slice(0, 5)}Z` : `${visit.date}T09:00Z`
  const initialParis = new Date(utcStr)
    .toLocaleString('sv-SE', { timeZone: 'Europe/Paris' })
    .replace(' ', 'T')
    .slice(0, 16)

  const [newDatetime, setNewDatetime] = useState(initialParis)
  const [duration, setDuration] = useState<string>('')
  const [notify, setNotify] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function submit() {
    setSaving(true)
    setError(null)
    const [dateStr, timeStr] = newDatetime.split('T')
    const res = await fetch(`/api/dashboard/visits/${visit.id}/reschedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: dateStr,
        time: timeStr,
        duration: duration ? Number(duration) : undefined,
        notify,
      }),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Erreur')
      setSaving(false)
      return
    }
    onSaved(visit.id, json.date, json.time)
  }

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/dashboard/visits/${visit.id}/cancel`, { method: 'POST' })
    onDeleted(visit.id)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#1D164E]">Déplacer le rendez-vous</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-[#1D164E]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {visit.nom_chien ?? visit.client_nom} — {SERVICE_LABELS[visit.service] ?? visit.service}
          {visit.staff ? ` · ${visit.staff}` : ''}
        </p>

        {confirmDelete ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              Vous êtes sûr de vouloir supprimer cette réservation ?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Suppression…' : 'Oui, supprimer'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Nouvelle date et heure
                </label>
                <input
                  type="datetime-local"
                  value={newDatetime}
                  onChange={(e) => setNewDatetime(e.target.value)}
                  className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Durée (min){' '}
                  <span className="text-gray-400 font-normal">
                    — laisser vide pour ne pas modifier
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Ex : 75"
                  className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
                />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notify}
                  onChange={(e) => setNotify(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-[#1D164E]"
                />
                <span className="text-xs text-gray-600">Envoyer un email au client</span>
              </label>
            </div>
            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={submit}
                disabled={saving || !newDatetime}
                className="flex-1 bg-[#1D164E] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#1D164E]/90 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Déplacement…' : 'Confirmer'}
              </button>
              <button
                onClick={onClose}
                className="px-4 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
            <button
              onClick={() => setConfirmDelete(true)}
              className="mt-3 w-full text-xs text-red-400 hover:text-red-600 transition-colors text-center"
            >
              Supprimer cette réservation
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── WeekGrid ─────────────────────────────────────────────────────────────────

interface WeekGridProps {
  monday: Date
  visits: CalVisit[]
  showStaff: boolean
  onReschedule: (v: CalVisit) => void
}

function WeekGrid({ monday, visits, showStaff, onReschedule }: WeekGridProps) {
  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(monday, i))
  const today = toLocalDateStr(new Date())

  function getVisitsAt(day: Date, hour: number): CalVisit[] {
    const dateStr = toLocalDateStr(day)
    return visits.filter((v) => v.date === dateStr && getParisHour(v.date, v.time) === hour)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-auto">
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
                        className="rounded-lg px-2 py-1.5 mb-1 group relative text-white"
                        style={{ backgroundColor: showStaff ? v.staff_color : '#4F6072' }}
                        title={`${v.client_nom}${v.nom_chien ? ` — ${v.nom_chien}` : ''} · ${SERVICE_LABELS[v.service] ?? v.service}`}
                      >
                        <p className="font-semibold truncate leading-tight">
                          {v.nom_chien ?? v.client_nom}
                        </p>
                        <p className="opacity-80 truncate leading-tight">
                          {v.time
                            ? new Date(`${v.date}T${v.time.slice(0, 5)}Z`).toLocaleTimeString(
                                'fr-FR',
                                { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }
                              )
                            : ''}
                          {showStaff && v.staff ? ` · ${v.staff}` : ''}
                        </p>
                        <button
                          onClick={() => onReschedule(v)}
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
  )
}

// ─── DayList (mobile) ─────────────────────────────────────────────────────────

const SERVICE_COLOR: Record<string, string> = {
  toilettage: '#4F6072',
  bains: '#4F6072',
  balneo: '#4F6072',
  massage: '#7C6F9F',
  osteo: '#7C6F9F',
  education: '#7C6F9F',
  creche: '#B85C38',
}

interface DayListProps {
  day: Date
  visits: CalVisit[]
  showStaff: boolean
  onReschedule: (v: CalVisit) => void
}

function DayList({ day, visits, showStaff, onReschedule }: DayListProps) {
  const dateStr = toLocalDateStr(day)
  const dayVisits = visits
    .filter((v) => v.date === dateStr)
    .sort((a, b) => (a.time ?? '00:00').localeCompare(b.time ?? '00:00'))

  if (dayVisits.length === 0) {
    return <div className="py-10 text-center text-sm text-gray-400">Aucun rendez-vous ce jour</div>
  }

  return (
    <div className="space-y-2">
      {dayVisits.map((v) => {
        const timeLabel = v.time
          ? new Date(`${v.date}T${v.time.slice(0, 5)}Z`).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Europe/Paris',
            })
          : null
        const color = showStaff
          ? v.staff_color
          : (SERVICE_COLOR[v.service.split('-')[0]] ?? '#4F6072')

        return (
          <div
            key={v.id}
            className="flex items-stretch gap-3 bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            {/* color strip */}
            <div className="w-1.5 shrink-0 rounded-l-2xl" style={{ backgroundColor: color }} />
            <div className="flex-1 py-3 pr-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#1D164E] leading-tight">
                    {v.nom_chien ?? v.client_nom}
                  </p>
                  {v.nom_chien && (
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Dog className="h-3 w-3" /> {v.client_nom}
                    </p>
                  )}
                </div>
                {timeLabel && (
                  <span className="shrink-0 text-xs font-bold text-[#1D164E] bg-[#F5F0EB] rounded-lg px-2 py-1">
                    {timeLabel}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {SERVICE_LABELS[v.service] ?? v.service}
                  {showStaff && v.staff ? ` · ${v.staff}` : ''}
                </span>
                <button
                  onClick={() => onReschedule(v)}
                  className="text-xs text-gray-400 hover:text-[#1D164E] flex items-center gap-1 transition-colors"
                >
                  <Clock className="h-3 w-3" /> Déplacer
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── CalendarSection ──────────────────────────────────────────────────────────

interface Tab {
  slug: string
  label: string
  showStaff: boolean
}

interface CalendarSectionProps {
  title: string
  tabs: Tab[]
}

function CalendarSection({ title, tabs }: CalendarSectionProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].slug)
  const [monday, setMonday] = useState<Date>(() => getMondayOf(new Date()))
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date())
  const [visits, setVisits] = useState<CalVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [rescheduling, setRescheduling] = useState<CalVisit | null>(null)

  // On mobile fetch a wider window: Mon–Sun of the selected day's week
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

  function handleDeleted(id: string) {
    setVisits((prev) => prev.filter((v) => v.id !== id))
    setRescheduling(null)
  }

  function handleSaved(id: string, date: string, time: string) {
    setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, date, time } : v)))
    setRescheduling(null)
  }

  // Keep selectedDay in sync when week changes
  function goWeek(delta: number) {
    setMonday((m) => {
      const next = addDays(m, delta)
      setSelectedDay(addDays(selectedDay, delta))
      return next
    })
  }

  const tab = tabs.find((t) => t.slug === activeTab) ?? tabs[0]
  const filtered = visits.filter((v) => v.service.startsWith(tab.slug))
  const today = toLocalDateStr(new Date())
  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(monday, i))

  // Count visits per day for the dot indicators
  function countForDay(day: Date) {
    const ds = toLocalDateStr(day)
    return filtered.filter((v) => v.date === ds).length
  }

  return (
    <div className={`transition-opacity ${loading ? 'opacity-50' : ''}`}>
      {rescheduling && (
        <RescheduleModal
          visit={rescheduling}
          onClose={() => setRescheduling(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{title}</p>

        {/* Tab switcher — desktop only */}
        <div className="hidden sm:flex items-center gap-2">
          {tabs.length > 1 && (
            <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm">
              {tabs.map((t) => (
                <button
                  key={t.slug}
                  onClick={() => setActiveTab(t.slug)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === t.slug
                      ? 'bg-[#1D164E] text-white'
                      : 'text-gray-500 hover:text-[#1D164E]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1 bg-white rounded-xl px-2 py-1 shadow-sm">
            <button
              onClick={() => setMonday((m) => addDays(m, -7))}
              className="p-1 rounded hover:bg-gray-100 transition-colors text-[#1D164E]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-medium text-[#1D164E] min-w-[168px] text-center">
              {formatHeader(monday)}
            </span>
            <button
              onClick={() => setMonday((m) => addDays(m, 7))}
              className="p-1 rounded hover:bg-gray-100 transition-colors text-[#1D164E]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setMonday(getMondayOf(new Date()))
                setSelectedDay(new Date())
              }}
              className="ml-1 px-2 py-0.5 text-xs font-medium rounded-lg border border-[#1D164E] text-[#1D164E] hover:bg-[#1D164E] hover:text-white transition-colors"
            >
              Auj.
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE: horizontal day picker + day list ── */}
      <div className="sm:hidden">
        {/* Week navigator */}
        <div className="flex items-center justify-between mb-3 bg-white rounded-2xl px-3 py-2 shadow-sm">
          <button
            onClick={() => goWeek(-7)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[#1D164E]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-medium text-[#1D164E]">{formatHeader(monday)}</span>
          <button
            onClick={() => goWeek(7)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[#1D164E]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day strip */}
        <div className="grid grid-cols-6 gap-1 mb-4">
          {weekDays.map((day, i) => {
            const ds = toLocalDateStr(day)
            const isToday = ds === today
            const isSelected = ds === toLocalDateStr(selectedDay)
            const count = countForDay(day)
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(day)}
                className={`flex flex-col items-center py-2 rounded-xl transition-colors ${
                  isSelected
                    ? 'bg-[#1D164E] text-white'
                    : isToday
                      ? 'bg-[#F5F0EB] text-[#B85C38]'
                      : 'bg-white text-[#1D164E]'
                }`}
              >
                <span className="text-[10px] font-medium opacity-70">{DAYS[i]}</span>
                <span className="text-base font-bold leading-tight">{day.getDate()}</span>
                <span
                  className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                    count > 0 ? (isSelected ? 'bg-white' : 'bg-[#B85C38]') : 'bg-transparent'
                  }`}
                />
              </button>
            )
          })}
        </div>

        {/* Tab switcher on mobile */}
        {tabs.length > 1 && (
          <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-4">
            {tabs.map((t) => (
              <button
                key={t.slug}
                onClick={() => setActiveTab(t.slug)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === t.slug ? 'bg-[#1D164E] text-white' : 'text-gray-500'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <DayList
          day={selectedDay}
          visits={filtered}
          showStaff={tab.showStaff}
          onReschedule={setRescheduling}
        />
      </div>

      {/* ── DESKTOP: week grid ── */}
      <div className="hidden sm:block">
        <WeekGrid
          monday={monday}
          visits={filtered}
          showStaff={tab.showStaff}
          onReschedule={setRescheduling}
        />
      </div>
    </div>
  )
}

// ─── CalendarView ─────────────────────────────────────────────────────────────

export function CalendarView() {
  return (
    <div className="space-y-8">
      {/* Spa POILUS — Toilettage / Bains / Balnéo */}
      <CalendarSection title="Spa POILUS" tabs={SPA_TABS} />

      {/* Bien-être — Massage / Ostéopathie */}
      <CalendarSection title="Bien-être" tabs={BIENETRE_TABS} />

      {/* Crèche & Éducation — Aurore */}
      <CalendarSection title="Crèche & Éducation" tabs={CRECHE_EDUCATION_TABS} />
    </div>
  )
}
