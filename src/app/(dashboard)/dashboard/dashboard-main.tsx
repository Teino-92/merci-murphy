'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { SumUpTopServices } from '@/components/dashboard/sumup-top-services'
import { SumUpPayouts } from '@/components/dashboard/sumup-payouts'
import { StatCard } from '@/components/dashboard/stat-card'
import type { DailyRevenue, TopProduct } from '@/lib/shopify-admin'
import type { ByProductEntry } from '@/components/dashboard/sumup-top-services'
import type { PayoutEntry } from '@/components/dashboard/sumup-payouts'
import type { ByDayEntry } from '@/components/dashboard/sumup-revenue-chart'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SumupData {
  byDay: ByDayEntry[]
  byProduct: ByProductEntry[]
  payouts: PayoutEntry[]
  totalRevenue: number
  transactionCount: number
  avgTicket: number
  refundRate: number
  refreshedAt: string | null
}

interface Props {
  initialFrom: string
  initialTo: string
  initialShopifyDaily: DailyRevenue[]
  initialShopifyTop: TopProduct[]
  initialSumup: SumupData | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatEUR(v: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(v)
}
function formatPercent(v: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(v)
}
function formatDateRange(from: string, to: string) {
  const f = new Date(from).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const t = new Date(to).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return from === to ? f : `${f} — ${t}`
}

const PRESETS = [
  {
    label: "Aujourd'hui",
    getDates: () => {
      const t = new Date().toISOString().slice(0, 10)
      return { from: t, to: t }
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
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
        to: now.toISOString().slice(0, 10),
      }
    },
  },
  {
    label: 'Cette année',
    getDates: () => ({
      from: `${new Date().getFullYear()}-01-01`,
      to: new Date().toISOString().slice(0, 10),
    }),
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardMain({
  initialFrom,
  initialTo,
  initialShopifyDaily,
  initialShopifyTop,
  initialSumup,
}: Props) {
  const router = useRouter()
  const [syncing, startSync] = useTransition()
  const [syncError, setSyncError] = useState<string | null>(null)
  const [syncOk, setSyncOk] = useState(false)

  const [from, setFrom] = useState(initialFrom)
  const [to, setTo] = useState(initialTo)
  const [customFrom, setCustomFrom] = useState(initialFrom)
  const [customTo, setCustomTo] = useState(initialTo)
  const [activePreset, setActivePreset] = useState(2) // Ce mois default
  const [showCustom, setShowCustom] = useState(false)

  const [shopifyDaily, setShopifyDaily] = useState(initialShopifyDaily)
  const [shopifyTop, setShopifyTop] = useState(initialShopifyTop)
  const [sumup, setSumup] = useState(initialSumup)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async (f: string, t: string) => {
    setLoading(true)
    setSyncOk(false)
    try {
      const [shopifyRes, sumupRes] = await Promise.all([
        fetch(`/api/dashboard/revenue?from=${f}&to=${t}`),
        fetch(`/api/dashboard/sumup/data?from=${f}&to=${t}`),
      ])
      const shopifyJson = await shopifyRes.json()
      const sumupJson = await sumupRes.json()
      setShopifyDaily(shopifyJson.daily ?? [])
      setShopifyTop(shopifyJson.top ?? [])
      if (sumupJson.data) {
        const d = sumupJson.data
        // Filter by_day to the requested range
        const byDay = (d.by_day ?? []).filter((e: ByDayEntry) => e.date >= f && e.date <= t)
        setSumup({
          byDay,
          byProduct: d.by_product ?? [],
          payouts: d.payouts ?? [],
          totalRevenue: byDay.reduce((s: number, e: ByDayEntry) => s + e.revenue, 0),
          transactionCount: d.transaction_count ?? 0,
          avgTicket: d.avg_ticket ?? 0,
          refundRate: d.refund_rate ?? 0,
          refreshedAt: d.refreshed_at ?? null,
        })
      } else {
        setSumup(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  function applyPreset(idx: number) {
    const { from: f, to: t } = PRESETS[idx].getDates()
    setActivePreset(idx)
    setShowCustom(false)
    setFrom(f)
    setTo(t)
    setCustomFrom(f)
    setCustomTo(t)
    fetchData(f, t)
  }

  function applyCustom() {
    if (!customFrom || !customTo || customFrom > customTo) return
    setActivePreset(-1)
    setFrom(customFrom)
    setTo(customTo)
    fetchData(customFrom, customTo)
  }

  function handleSync() {
    setSyncError(null)
    setSyncOk(false)
    startSync(async () => {
      try {
        const res = await fetch(`/api/dashboard/sumup/sync?from=${from}&to=${to}`, {
          method: 'POST',
        })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          setSyncError((json as { error?: string }).error ?? 'Erreur de synchronisation')
          return
        }
        setSyncOk(true)
        await fetchData(from, to)
        router.refresh()
      } catch {
        setSyncError('Erreur réseau')
      }
    })
  }

  const sumupTotal = sumup?.totalRevenue ?? 0
  const refreshedAt = sumup?.refreshedAt
    ? new Date(sumup.refreshedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div>
      {/* Period controls */}
      <div className="bg-white rounded-2xl px-5 py-4 shadow-sm mb-6 flex flex-wrap items-center gap-3">
        {/* Presets */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => applyPreset(i)}
              className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap ${
                activePreset === i ? 'bg-[#1D164E] text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => setShowCustom(!showCustom)}
            className={`px-3 py-1.5 font-medium transition-colors border-l border-gray-200 ${
              activePreset === -1 ? 'bg-[#1D164E] text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Perso
          </button>
        </div>

        {/* Custom date inputs */}
        {showCustom && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white text-sm text-gray-700 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
            />
            <span className="text-gray-400 text-sm">→</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white text-sm text-gray-700 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
            />
            <button
              onClick={applyCustom}
              disabled={!customFrom || !customTo || customFrom > customTo}
              className="bg-[#1D164E] text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-[#1D164E]/90 disabled:opacity-40 transition-colors"
            >
              OK
            </button>
          </div>
        )}

        {/* Period label */}
        <span className="text-xs text-gray-400 font-medium">{formatDateRange(from, to)}</span>

        <div className="ml-auto flex items-center gap-3">
          {refreshedAt && (
            <span className="text-xs text-gray-400 hidden sm:block">
              SumUp actualisé le {refreshedAt}
            </span>
          )}
          {syncError && <span className="text-xs text-red-500">{syncError}</span>}
          {syncOk && !syncing && (
            <span className="text-xs text-green-600">Données mises à jour</span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing || loading}
            className="flex items-center gap-2 bg-[#C4714A] text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-[#C4714A]/90 transition-colors disabled:opacity-60"
          >
            {syncing ? (
              <>
                <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Actualisation…
              </>
            ) : (
              'Actualiser SumUp'
            )}
          </button>
        </div>
      </div>

      {/* SumUp KPIs for selected period */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          SumUp — {formatDateRange(from, to)}
        </h2>
        <div
          className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity ${loading ? 'opacity-50' : ''}`}
        >
          <StatCard
            label="CA SumUp"
            value={sumupTotal > 0 ? formatEUR(sumupTotal) : '—'}
            highlight={sumupTotal > 0}
          />
          <StatCard
            label="Ticket moyen"
            value={sumup && sumup.avgTicket > 0 ? formatEUR(sumup.avgTicket) : '—'}
          />
          <StatCard label="Transactions" value={sumup ? String(sumup.transactionCount) : '—'} />
          <StatCard
            label="Taux de remboursement"
            value={sumup ? formatPercent(sumup.refundRate) : '—'}
            sub={sumup?.refundRate === 0 ? 'Aucun remboursement' : undefined}
          />
        </div>
      </section>

      {/* Combined revenue chart */}
      <section className="mb-6">
        <RevenueChart
          initialDaily={shopifyDaily}
          initialTop={shopifyTop}
          initialSumupDaily={sumup?.byDay ?? []}
          from={from}
          to={to}
          loading={loading}
        />
      </section>

      {/* SumUp top services */}
      {sumup && sumup.byProduct.length > 0 && (
        <section className="mb-6">
          <SumUpTopServices byProduct={sumup.byProduct} />
        </section>
      )}

      {/* SumUp payouts */}
      {sumup && sumup.payouts.length > 0 && (
        <section className="mb-6">
          <SumUpPayouts payouts={sumup.payouts} />
        </section>
      )}
    </div>
  )
}
