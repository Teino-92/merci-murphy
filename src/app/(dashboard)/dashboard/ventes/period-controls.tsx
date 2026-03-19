'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

interface Props {
  currentFrom: string
  currentTo: string
}

const PRESETS = [
  {
    label: "Aujourd'hui",
    getDates: () => {
      const to = new Date().toISOString().slice(0, 10)
      return { from: to, to }
    },
  },
  {
    label: 'Cette semaine',
    getDates: () => {
      const now = new Date()
      const day = now.getDay() === 0 ? 6 : now.getDay() - 1
      const from = new Date(now)
      from.setDate(now.getDate() - day)
      return { from: from.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) }
    },
  },
  {
    label: 'Ce mois',
    getDates: () => {
      const now = new Date()
      const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
      return { from, to: now.toISOString().slice(0, 10) }
    },
  },
  {
    label: 'Cette année',
    getDates: () => {
      const now = new Date()
      return { from: `${now.getFullYear()}-01-01`, to: now.toISOString().slice(0, 10) }
    },
  },
]

export function VentesPeriodControls({ currentFrom, currentTo }: Props) {
  const router = useRouter()
  const [syncing, startSync] = useTransition()
  const [syncError, setSyncError] = useState<string | null>(null)
  const [syncOk, setSyncOk] = useState(false)
  const [customFrom, setCustomFrom] = useState(currentFrom)
  const [customTo, setCustomTo] = useState(currentTo)

  function navigate(from: string, to: string) {
    router.push(`/dashboard/ventes?from=${from}&to=${to}`)
  }

  function handlePreset(preset: (typeof PRESETS)[0]) {
    const { from, to } = preset.getDates()
    setCustomFrom(from)
    setCustomTo(to)
    navigate(from, to)
  }

  function handleCustomApply() {
    if (customFrom && customTo && customFrom <= customTo) {
      navigate(customFrom, customTo)
    }
  }

  async function handleSync() {
    setSyncError(null)
    setSyncOk(false)
    startSync(async () => {
      try {
        const res = await fetch(`/api/dashboard/sumup/sync?from=${currentFrom}&to=${currentTo}`, {
          method: 'POST',
        })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          setSyncError((json as { error?: string }).error ?? 'Erreur de synchronisation')
          return
        }
        setSyncOk(true)
        router.refresh()
      } catch {
        setSyncError('Erreur réseau')
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Quick presets */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
        {PRESETS.map((p) => {
          const { from, to } = p.getDates()
          const active = from === currentFrom && to === currentTo
          return (
            <button
              key={p.label}
              onClick={() => handlePreset(p)}
              className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap ${
                active ? 'bg-[#1D164E] text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      {/* Custom date range */}
      <div className="flex items-center gap-1.5 text-sm">
        <input
          type="date"
          value={customFrom}
          onChange={(e) => setCustomFrom(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white text-sm text-gray-700 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
        />
        <span className="text-gray-400">→</span>
        <input
          type="date"
          value={customTo}
          onChange={(e) => setCustomTo(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white text-sm text-gray-700 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
        />
        <button
          onClick={handleCustomApply}
          disabled={!customFrom || !customTo || customFrom > customTo}
          className="bg-[#1D164E] text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-[#1D164E]/90 disabled:opacity-40 transition-colors"
        >
          OK
        </button>
      </div>

      {/* Sync button */}
      <button
        onClick={handleSync}
        disabled={syncing}
        className="flex items-center gap-2 bg-[#C4714A] text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-[#C4714A]/90 transition-colors disabled:opacity-60"
      >
        {syncing ? (
          <>
            <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Actualisation…
          </>
        ) : (
          'Actualiser'
        )}
      </button>

      {syncError && <p className="text-xs text-red-500">{syncError}</p>}
      {syncOk && !syncing && <p className="text-xs text-green-600">Données mises à jour</p>}
    </div>
  )
}
