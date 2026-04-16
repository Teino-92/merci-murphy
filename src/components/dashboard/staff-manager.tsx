'use client'

import { useState } from 'react'
import type { Staff, Availability } from '@/lib/supabase-admin'
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { StaffScheduleEditor } from '@/components/dashboard/staff-schedule-editor'

const DAYS = ['', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const ROLES = ['toiletteur', 'educateur', 'osteopathe', 'masseur']

interface StaffWithDetails extends Staff {
  availabilities: Availability[]
}

export function StaffManager({
  initialStaff,
}: {
  initialStaff: StaffWithDetails[]
  isAdmin: boolean
}) {
  const [staffList, setStaffList] = useState(initialStaff)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [activeStaffTab, setActiveStaffTab] = useState<Record<string, string>>({})
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('toiletteur')
  const [newColor, setNewColor] = useState('#4F6072')
  const [adding, setAdding] = useState(false)

  const inputCls =
    'text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D164E] w-full'

  async function addStaff() {
    if (!newName) return
    setAdding(true)
    const res = await fetch('/api/dashboard/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, role: newRole, color: newColor }),
    })
    const s = await res.json()
    setStaffList((prev) => [...prev, { ...s, availabilities: [] }])
    setNewName('')
    setAdding(false)
  }

  async function toggleActive(s: StaffWithDetails) {
    await fetch(`/api/dashboard/staff/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !s.active }),
    })
    setStaffList((prev) => prev.map((m) => (m.id === s.id ? { ...m, active: !m.active } : m)))
  }

  async function upsertAvail(
    staffId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ) {
    await fetch(`/api/dashboard/staff/${staffId}/availabilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day_of_week: dayOfWeek, start_time: startTime, end_time: endTime }),
    })
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s
        const existing = s.availabilities.find((a) => a.day_of_week === dayOfWeek)
        if (existing) {
          return {
            ...s,
            availabilities: s.availabilities.map((a) =>
              a.day_of_week === dayOfWeek ? { ...a, start_time: startTime, end_time: endTime } : a
            ),
          }
        }
        return {
          ...s,
          availabilities: [
            ...s.availabilities,
            {
              id: Date.now().toString(),
              staff_id: staffId,
              day_of_week: dayOfWeek,
              start_time: startTime,
              end_time: endTime,
            },
          ],
        }
      })
    )
  }

  async function removeAvail(staffId: string, availId: string) {
    await fetch(`/api/dashboard/staff/${staffId}/availabilities`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: availId }),
    })
    setStaffList((prev) =>
      prev.map((s) =>
        s.id !== staffId
          ? s
          : { ...s, availabilities: s.availabilities.filter((a) => a.id !== availId) }
      )
    )
  }

  return (
    <div className="space-y-4">
      {/* Add staff */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Ajouter un membre
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <input
            className={inputCls}
            placeholder="Prénom"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <select className={inputCls} value={newRole} onChange={(e) => setNewRole(e.target.value)}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="h-9 w-12 rounded border border-gray-200 cursor-pointer"
            />
            <span className="text-xs text-gray-400">Couleur calendrier</span>
          </div>
        </div>
        <button
          onClick={addStaff}
          disabled={adding || !newName}
          className="flex items-center gap-2 bg-[#1D164E] text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> {adding ? 'Ajout…' : 'Ajouter'}
        </button>
      </div>

      {/* Staff list */}
      {staffList.map((s) => (
        <div key={s.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <div>
                <p className="font-semibold text-[#1D164E]">{s.name}</p>
                <p className="text-xs text-gray-400">{s.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleActive(s)}
                className={`text-xs px-3 py-1 rounded-full font-medium ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
              >
                {s.active ? 'Actif' : 'Inactif'}
              </button>
              <button
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                className="text-gray-400 hover:text-[#1D164E] transition-colors"
              >
                {expanded === s.id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {expanded === s.id && (
            <div className="border-t border-gray-100 p-5">
              {s.role === 'toiletteur' ? (
                <div>
                  {/* Tab switcher */}
                  <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4 w-fit">
                    {(['planning', 'disponibilites'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveStaffTab((prev) => ({ ...prev, [s.id]: tab }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          (activeStaffTab[s.id] ?? 'planning') === tab
                            ? 'bg-white text-[#1D164E] shadow-sm'
                            : 'text-gray-500 hover:text-[#1D164E]'
                        }`}
                      >
                        {tab === 'planning' ? 'Planning mensuel' : 'Dispos hebdo'}
                      </button>
                    ))}
                  </div>

                  {(activeStaffTab[s.id] ?? 'planning') === 'planning' && (
                    <StaffScheduleEditor staffId={s.id} staffName={s.name} />
                  )}

                  {(activeStaffTab[s.id] ?? 'planning') === 'disponibilites' && (
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5, 6].map((day) => {
                        const avail = s.availabilities.find((a) => a.day_of_week === day)
                        return (
                          <AvailRow
                            key={day}
                            dayLabel={DAYS[day]}
                            avail={avail}
                            onSave={(start, end) => upsertAvail(s.id, day, start, end)}
                            onRemove={avail ? () => removeAvail(s.id, avail.id) : undefined}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Non-toiletteurs: disponibilités hebdo only */
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                    Disponibilités hebdomadaires
                  </p>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5, 6].map((day) => {
                      const avail = s.availabilities.find((a) => a.day_of_week === day)
                      return (
                        <AvailRow
                          key={day}
                          dayLabel={DAYS[day]}
                          avail={avail}
                          onSave={(start, end) => upsertAvail(s.id, day, start, end)}
                          onRemove={avail ? () => removeAvail(s.id, avail.id) : undefined}
                        />
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function AvailRow({
  dayLabel,
  avail,
  onSave,
  onRemove,
}: {
  dayLabel: string
  avail?: Availability
  onSave: (start: string, end: string) => void
  onRemove?: () => void
}) {
  const [start, setStart] = useState(avail?.start_time?.slice(0, 5) ?? '09:00')
  const [end, setEnd] = useState(avail?.end_time?.slice(0, 5) ?? '19:00')
  const inputCls =
    'text-sm rounded border border-gray-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1D164E]'

  return (
    <div className="flex items-center gap-3">
      <span className="w-8 text-xs font-medium text-gray-500">{dayLabel}</span>
      <input
        type="time"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className={inputCls}
      />
      <span className="text-xs text-gray-400">→</span>
      <input
        type="time"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        className={inputCls}
      />
      <button
        onClick={() => onSave(start, end)}
        className="text-xs bg-[#1D164E] text-white rounded px-2 py-1 font-medium hover:bg-[#1D164E]/90 transition-colors"
      >
        OK
      </button>
      {onRemove && (
        <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
