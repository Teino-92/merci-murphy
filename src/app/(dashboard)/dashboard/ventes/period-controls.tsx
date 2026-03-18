'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

interface Props {
  currentPeriod: string
}

function buildPeriods(): { label: string; value: string }[] {
  const now = new Date()
  const periods = []

  // Mois en cours
  const curr = now.toISOString().slice(0, 7)
  periods.push({
    label: 'Mois en cours',
    value: curr,
  })

  // Mois dernier
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  periods.push({
    label: 'Mois dernier',
    value: lastMonthDate.toISOString().slice(0, 7),
  })

  // Il y a 2 mois
  const twoMonthsDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  periods.push({
    label: twoMonthsDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
    value: twoMonthsDate.toISOString().slice(0, 7),
  })

  return periods
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
      <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePeriodChange(p.value)}
            className={`px-3 py-1.5 font-medium transition-colors ${
              currentPeriod === p.value
                ? 'bg-[#1D164E] text-white'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {p.label}
          </button>
        ))}
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
