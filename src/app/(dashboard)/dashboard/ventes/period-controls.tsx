'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

interface Props {
  currentPeriod: string
}

function buildPeriods(): { label: string; value: string }[] {
  const now = new Date()
  const periods: { label: string; value: string }[] = []

  // Generate all months from 2023-01 to current month
  let d = new Date(2023, 0, 1)
  const limit = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  while (d < limit) {
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    periods.push({ label: label.charAt(0).toUpperCase() + label.slice(1), value })
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  }

  return periods.reverse() // most recent first
}

export function VentesPeriodControls({ currentPeriod }: Props) {
  const router = useRouter()
  const [syncing, startSync] = useTransition()
  const [syncError, setSyncError] = useState<string | null>(null)
  const [syncOk, setSyncOk] = useState(false)

  const periods = buildPeriods()

  function handlePeriodChange(period: string) {
    router.push(`/dashboard/ventes?period=${period}`)
  }

  async function handleSync() {
    setSyncError(null)
    setSyncOk(false)
    startSync(async () => {
      try {
        const res = await fetch(`/api/dashboard/sumup/sync?period=${currentPeriod}`, {
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
    <div className="flex flex-wrap items-center gap-3">
      {/* Period selector */}
      <select
        value={currentPeriod}
        onChange={(e) => handlePeriodChange(e.target.value)}
        className="rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
      >
        {periods.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

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
