'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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

  // Group visits by date+hour
  function getVisitsAt(day: Date, hour: number): CalVisit[] {
    const dateStr = toLocalDateStr(day)
    return visits.filter((v) => {
      if (v.date !== dateStr) return false
      if (!v.time) return hour === 9
      const h = parseInt(v.time.slice(0, 2), 10)
      return h === hour
    })
  }

  return (
    <div>
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
                    <td key={di} className="align-top p-1 min-h-[48px]" style={{ minWidth: 90 }}>
                      {slot.map((v) => (
                        <div
                          key={v.id}
                          className={`rounded-lg px-2 py-1.5 mb-1 ${STAFF_COLORS[v.staff ?? ''] ?? DEFAULT_COLOR}`}
                          title={`${v.client_nom}${v.nom_chien ? ` — ${v.nom_chien}` : ''} · ${SERVICE_LABELS[v.service] ?? v.service}`}
                        >
                          <p className="font-semibold truncate leading-tight">
                            {v.nom_chien ?? v.client_nom}
                          </p>
                          <p className="opacity-80 truncate leading-tight">
                            {SERVICE_LABELS[v.service] ?? v.service}
                            {v.staff ? ` · ${v.staff}` : ''}
                          </p>
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
