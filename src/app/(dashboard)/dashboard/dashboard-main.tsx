'use client'

import { useState, useTransition, useCallback } from 'react'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { StatCard } from '@/components/dashboard/stat-card'
import type { DailyRevenue, TopProduct } from '@/lib/shopify-admin'
import { SERVICE_LABELS } from '@/lib/dog-constants'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VisitsStats {
  totalRevenue: number
  visitCount: number
  avgTicket: number
  byService: { service: string; revenue: number; count: number }[]
}

interface Props {
  initialFrom: string
  initialTo: string
  initialShopifyDaily: DailyRevenue[]
  initialShopifyTop: TopProduct[]
  initialVisits: VisitsStats
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatEUR(v: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
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

function localDateStr(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const PRESETS = [
  {
    label: "Aujourd'hui",
    getDates: () => {
      const t = localDateStr(new Date())
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
      return { from: localDateStr(from), to: localDateStr(now) }
    },
  },
  {
    label: 'Ce mois',
    getDates: () => {
      const now = new Date()
      return {
        from: localDateStr(new Date(now.getFullYear(), now.getMonth(), 1)),
        to: localDateStr(now),
      }
    },
  },
  {
    label: 'Cette année',
    getDates: () => ({
      from: `${new Date().getFullYear()}-01-01`,
      to: localDateStr(new Date()),
    }),
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardMain({
  initialFrom,
  initialTo,
  initialShopifyDaily,
  initialShopifyTop,
  initialVisits,
}: Props) {
  const [, startTransition] = useTransition()

  const [from, setFrom] = useState(initialFrom)
  const [to, setTo] = useState(initialTo)
  const [customFrom, setCustomFrom] = useState(initialFrom)
  const [customTo, setCustomTo] = useState(initialTo)
  const [activePreset, setActivePreset] = useState(2) // Ce mois default
  const [showCustom, setShowCustom] = useState(false)

  const [shopifyDaily, setShopifyDaily] = useState(initialShopifyDaily)
  const [shopifyTop, setShopifyTop] = useState(initialShopifyTop)
  const [visits, setVisits] = useState(initialVisits)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async (f: string, t: string) => {
    setLoading(true)
    try {
      const [shopifyRes, visitsRes] = await Promise.all([
        fetch(`/api/dashboard/revenue?from=${f}&to=${t}`),
        fetch(`/api/dashboard/visits?from=${f}&to=${t}`),
      ])
      const shopifyJson = await shopifyRes.json()
      const visitsJson = await visitsRes.json()
      setShopifyDaily(shopifyJson.daily ?? [])
      setShopifyTop(shopifyJson.top ?? [])
      setVisits(visitsJson)
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
    startTransition(() => {
      fetchData(f, t)
    })
  }

  function applyCustom() {
    if (!customFrom || !customTo || customFrom > customTo) return
    setActivePreset(-1)
    setFrom(customFrom)
    setTo(customTo)
    startTransition(() => {
      fetchData(customFrom, customTo)
    })
  }

  const avgTicket = visits.visitCount > 0 ? Math.round(visits.totalRevenue / visits.visitCount) : 0

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
                activePreset === i ? 'bg-[#4F6072] text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => setShowCustom(!showCustom)}
            className={`px-3 py-1.5 font-medium transition-colors border-l border-gray-200 ${
              activePreset === -1 ? 'bg-[#4F6072] text-white' : 'text-gray-500 hover:bg-gray-50'
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
              className="rounded-lg border border-gray-200 bg-white text-sm text-gray-700 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#4F6072]"
            />
            <span className="text-gray-400 text-sm">→</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white text-sm text-gray-700 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#4F6072]"
            />
            <button
              onClick={applyCustom}
              disabled={!customFrom || !customTo || customFrom > customTo}
              className="bg-[#4F6072] text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-[#4F6072]/90 disabled:opacity-40 transition-colors"
            >
              OK
            </button>
          </div>
        )}

        {/* Period label */}
        <span className="text-xs text-gray-400 font-medium">{formatDateRange(from, to)}</span>
      </div>

      {/* Visits KPIs */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Services — {formatDateRange(from, to)}
        </h2>
        <div
          className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity ${loading ? 'opacity-50' : ''}`}
        >
          <StatCard
            label="CA services"
            value={visits.totalRevenue > 0 ? formatEUR(visits.totalRevenue) : '—'}
            highlight={visits.totalRevenue > 0}
            sub="Visites enregistrées"
          />
          <StatCard
            label="Visites"
            value={visits.visitCount > 0 ? String(visits.visitCount) : '—'}
            sub="Avec prix renseigné"
          />
          <StatCard label="Ticket moyen" value={avgTicket > 0 ? formatEUR(avgTicket) : '—'} />
          <StatCard
            label="Top service"
            value={
              visits.byService[0]
                ? (SERVICE_LABELS[visits.byService[0].service] ?? visits.byService[0].service)
                : '—'
            }
            sub={
              visits.byService[0]
                ? `${visits.byService[0].count} visite${visits.byService[0].count > 1 ? 's' : ''} · ${formatEUR(visits.byService[0].revenue)}`
                : undefined
            }
          />
        </div>
      </section>

      {/* Service breakdown */}
      {visits.byService.length > 0 && (
        <section className="mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">
              Répartition par service
            </p>
            <div className="space-y-3">
              {visits.byService.map((s) => {
                const label = SERVICE_LABELS[s.service] ?? s.service
                const pct = visits.totalRevenue > 0 ? (s.revenue / visits.totalRevenue) * 100 : 0
                return (
                  <div key={s.service}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#4F6072]">
                        {label}
                        <span className="text-gray-400 ml-2 font-normal">
                          {s.count} visite{s.count > 1 ? 's' : ''}
                        </span>
                      </span>
                      <span className="text-sm font-bold text-[#4F6072]">
                        {formatEUR(s.revenue)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#4F6072]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Shopify revenue chart */}
      <section className="mb-6">
        <RevenueChart
          initialDaily={shopifyDaily}
          initialTop={shopifyTop}
          from={from}
          to={to}
          loading={loading}
        />
      </section>
    </div>
  )
}
