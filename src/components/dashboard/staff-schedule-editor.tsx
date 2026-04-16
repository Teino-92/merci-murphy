'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { StaffSchedule } from '@/lib/supabase-admin'

interface Props {
  staffId: string
  staffName: string
}

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const DEFAULT_START = '09:30'
const DEFAULT_END = '18:30'

function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = []
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    const dow = d.getDay() // 0=Sun
    if (dow !== 0) days.push(new Date(d)) // exclude Sunday
    d.setDate(d.getDate() + 1)
  }
  return days
}

function toDateStr(d: Date): string {
  return d.toLocaleDateString('fr-CA') // YYYY-MM-DD
}

function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })
}

export function StaffScheduleEditor({ staffId }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [entries, setEntries] = useState<StaffSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null) // dateStr being saved

  const days = getMonthDays(year, month)
  const firstDay = toDateStr(new Date(year, month, 1))
  const lastDay = toDateStr(new Date(year, month + 1, 0))

  useEffect(() => {
    setLoading(true)
    fetch(`/api/dashboard/staff/${staffId}/schedule?from=${firstDay}&to=${lastDay}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [staffId, firstDay, lastDay])

  function getEntry(dateStr: string): StaffSchedule | undefined {
    return entries.find((e) => e.date === dateStr)
  }

  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1)
      setMonth(11)
    } else {
      setMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1)
      setMonth(0)
    } else {
      setMonth((m) => m + 1)
    }
  }

  async function toggleDay(dateStr: string) {
    const existing = getEntry(dateStr)
    if (existing) {
      setSaving(dateStr)
      await fetch(`/api/dashboard/staff/${staffId}/schedule`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: existing.id }),
      })
      setEntries((prev) => prev.filter((e) => e.id !== existing.id))
      setSaving(null)
    } else {
      setSaving(dateStr)
      const res = await fetch(`/api/dashboard/staff/${staffId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, start_time: DEFAULT_START, end_time: DEFAULT_END }),
      })
      const data = await res.json()
      if (res.ok) setEntries((prev) => [...prev, data])
      setSaving(null)
    }
  }

  function updateTime(entry: StaffSchedule, field: 'start_time' | 'end_time', value: string) {
    const updated = { ...entry, [field]: value }
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? updated : e)))
  }

  async function saveTime(entry: StaffSchedule) {
    if (entry.start_time >= entry.end_time) return
    setSaving(entry.date)
    await fetch(`/api/dashboard/staff/${staffId}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: entry.date,
        start_time: entry.start_time,
        end_time: entry.end_time,
      }),
    })
    setSaving(null)
  }

  // Group days by week for grid layout (Mon–Sat, 6 cols)
  const weeks: (Date | null)[][] = []
  let currentWeek: (Date | null)[] = []
  const firstDow = days[0]?.getDay() ?? 1 // 1=Mon
  const padStart = firstDow === 0 ? 6 : firstDow - 1
  for (let i = 0; i < padStart; i++) currentWeek.push(null)
  for (const day of days) {
    currentWeek.push(day)
    const dow = day.getDay()
    if (dow === 6) {
      // Saturday = end of display week
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  if (currentWeek.length > 0) weeks.push(currentWeek)

  const inputCls =
    'w-full text-xs rounded border px-1.5 py-1 focus:outline-none focus:ring-1 bg-white/10 text-white border-white/30 focus:ring-white/50'

  return (
    <div className={`transition-opacity ${loading ? 'opacity-50' : ''}`}>
      {/* Month navigator */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[#1D164E]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-[#1D164E] capitalize">
          {formatMonthLabel(year, month)}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[#1D164E]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-6 gap-1 mb-1">
        {DAY_LABELS.map((l) => (
          <div key={l} className="text-center text-xs font-medium text-gray-400 py-1">
            {l}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-6 gap-1">
            {Array.from({ length: 6 }, (_, i) => {
              const day = week[i] ?? null
              if (!day) return <div key={i} />
              const dateStr = toDateStr(day)
              const entry = getEntry(dateStr)
              const isActive = !!entry
              const isSaving = saving === dateStr
              const isInvalid = entry && entry.start_time >= entry.end_time

              return (
                <div
                  key={dateStr}
                  className={`rounded-xl border transition-all ${
                    isActive
                      ? 'border-[#1D164E] bg-[#1D164E]'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${isSaving ? 'opacity-60' : ''}`}
                >
                  {/* Day number — click to toggle */}
                  <button
                    onClick={() => toggleDay(dateStr)}
                    disabled={isSaving}
                    className={`w-full text-center py-2 text-sm font-semibold transition-colors ${
                      isActive ? 'text-white' : 'text-[#1D164E] hover:text-[#1D164E]/70'
                    }`}
                  >
                    {day.getDate()}
                  </button>

                  {/* Time inputs when active */}
                  {isActive && entry && (
                    <div className="px-1 pb-2 space-y-1">
                      <input
                        type="time"
                        value={entry.start_time.slice(0, 5)}
                        onChange={(e) => updateTime(entry, 'start_time', e.target.value)}
                        onBlur={() => saveTime(entry)}
                        className={inputCls}
                      />
                      <input
                        type="time"
                        value={entry.end_time.slice(0, 5)}
                        onChange={(e) => updateTime(entry, 'end_time', e.target.value)}
                        onBlur={() => saveTime(entry)}
                        className={`${inputCls} ${isInvalid ? 'border-red-400' : ''}`}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <p className="text-xs text-gray-400 mt-3">
        Cliquer sur un jour pour l&apos;activer ou désactiver · Les horaires se sauvegardent à la
        saisie
      </p>
    </div>
  )
}
