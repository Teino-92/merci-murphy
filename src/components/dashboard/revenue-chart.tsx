'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import type { DailyRevenue, TopProduct } from '@/lib/shopify-admin'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10)
}
function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}
function formatEUR(v: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(v)
}
function formatLabel(dateStr: string, totalDays: number) {
  const d = new Date(dateStr)
  if (totalDays <= 7) return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const PRESETS = [
  { label: '7j', from: () => daysAgo(7), to: today },
  { label: '30j', from: () => daysAgo(30), to: today },
  { label: '90j', from: () => daysAgo(90), to: today },
]

const METRICS = [
  { label: "Chiffre d'affaires", key: 'revenue' as const },
  { label: 'Commandes', key: 'orders' as const },
]

const CHART_TYPES = [
  { label: 'Courbe', value: 'area' as const },
  { label: 'Barres', value: 'bar' as const },
]

// ─── Top Products ─────────────────────────────────────────────────────────────

function TopProducts({ items }: { items: TopProduct[] }) {
  if (items.length === 0)
    return <p className="text-sm text-gray-300 text-center py-6">Aucune donnée</p>

  const max = items[0]?.quantity ?? 1

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={item.title}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-[#1D164E] truncate max-w-[65%]">
              <span className="text-gray-300 mr-2">#{i + 1}</span>
              {item.title}
            </span>
            <div className="text-right shrink-0">
              <span className="text-sm font-bold text-[#1D164E]">{item.quantity} ventes</span>
              <span className="text-xs text-gray-400 ml-2">{formatEUR(item.revenue)}</span>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#1D164E]"
              style={{ width: `${(item.quantity / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  initialDaily: DailyRevenue[]
  initialTop: TopProduct[]
}

export function RevenueChart({ initialDaily, initialTop }: Props) {
  const [metric, setMetric] = useState<'revenue' | 'orders'>('revenue')
  const [chartType, setChartType] = useState<'area' | 'bar'>('area')
  const [activePreset, setActivePreset] = useState<number>(1) // 30j default
  const [customFrom, setCustomFrom] = useState(daysAgo(30))
  const [customTo, setCustomTo] = useState(today())
  const [showCustom, setShowCustom] = useState(false)
  const [daily, setDaily] = useState<DailyRevenue[]>(initialDaily)
  const [top, setTop] = useState<TopProduct[]>(initialTop)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async (from: string, to: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/revenue?from=${from}&to=${to}`)
      const json = await res.json()
      setDaily(json.daily ?? [])
      setTop(json.top ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  function applyPreset(idx: number) {
    setActivePreset(idx)
    setShowCustom(false)
    const p = PRESETS[idx]
    fetchData(p.from(), p.to())
  }

  function applyCustom() {
    if (!customFrom || !customTo || customFrom > customTo) return
    setActivePreset(-1)
    fetchData(customFrom, customTo)
  }

  const totalDays = useMemo(() => {
    const diff = new Date(customTo).getTime() - new Date(customFrom).getTime()
    return Math.ceil(diff / 86400000) + 1
  }, [customFrom, customTo])

  const chartData = useMemo(
    () => daily.map((d) => ({ ...d, label: formatLabel(d.date, totalDays) })),
    [daily, totalDays]
  )

  const total = useMemo(() => chartData.reduce((sum, d) => sum + d[metric], 0), [chartData, metric])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any) => {
    const n = Number(value ?? 0)
    return metric === 'revenue' ? formatEUR(n) : `${n} commande${n > 1 ? 's' : ''}`
  }

  const yFormatter = (v: number) => (metric === 'revenue' ? formatEUR(v) : String(v))

  const empty = chartData.every((d) => d[metric] === 0)

  return (
    <div className="space-y-4">
      {/* Chart card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              {METRICS.find((m) => m.key === metric)?.label}
            </p>
            <p className="mt-1 text-3xl font-bold text-[#1D164E]">
              {loading ? '…' : metric === 'revenue' ? formatEUR(total) : total}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Preset periods */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
              {PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(i)}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    activePreset === i
                      ? 'bg-[#1D164E] text-white'
                      : 'text-gray-500 hover:bg-gray-50'
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

            {/* Metric */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
              {METRICS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMetric(m.key)}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    metric === m.key ? 'bg-[#1D164E] text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Chart type */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
              {CHART_TYPES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setChartType(c.value)}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    chartType === c.value
                      ? 'bg-[#1D164E] text-white'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom date picker */}
        {showCustom && (
          <div className="flex flex-wrap items-end gap-3 mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Du</label>
              <input
                type="date"
                value={customFrom}
                max={customTo}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Au</label>
              <input
                type="date"
                value={customTo}
                min={customFrom}
                max={today()}
                onChange={(e) => setCustomTo(e.target.value)}
                className="text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
              />
            </div>
            <button
              onClick={applyCustom}
              className="bg-[#1D164E] text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-[#1D164E]/90 transition-colors"
            >
              Appliquer
            </button>
          </div>
        )}

        {/* Chart */}
        {empty ? (
          <div className="h-56 flex items-center justify-center text-gray-300 text-sm">
            Aucune donnée — token Admin Shopify requis
          </div>
        ) : (
          <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
            <ResponsiveContainer width="100%" height={240}>
              {chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1D164E" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1D164E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={yFormatter}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                    width={metric === 'revenue' ? 70 : 30}
                  />
                  <Tooltip
                    formatter={tooltipFormatter}
                    labelStyle={{ color: '#1D164E', fontWeight: 600 }}
                    contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0', fontSize: 13 }}
                  />
                  <Area
                    type="monotone"
                    dataKey={metric}
                    stroke="#1D164E"
                    strokeWidth={2}
                    fill="url(#colorMetric)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#1D164E' }}
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={yFormatter}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                    width={metric === 'revenue' ? 70 : 30}
                  />
                  <Tooltip
                    formatter={tooltipFormatter}
                    labelStyle={{ color: '#1D164E', fontWeight: 600 }}
                    contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0', fontSize: 13 }}
                    cursor={{ fill: '#1D164E10' }}
                  />
                  <Bar dataKey={metric} fill="#1D164E" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top products card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">
          Top 5 produits — même période
        </p>
        <TopProducts items={top} />
      </div>
    </div>
  )
}
