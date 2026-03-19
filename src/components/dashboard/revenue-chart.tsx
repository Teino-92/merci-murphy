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

// ─── Types ────────────────────────────────────────────────────────────────────

interface SumUpDay {
  date: string
  revenue: number
  count: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10)
}
function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}
function startOfWeek() {
  const now = new Date()
  const day = now.getDay() === 0 ? 6 : now.getDay() - 1
  const from = new Date(now)
  from.setDate(now.getDate() - day)
  return from.toISOString().slice(0, 10)
}
function startOfMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
}
function startOfYear() {
  return `${new Date().getFullYear()}-01-01`
}

function formatEUR(v: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(v)
}
function formatLabel(dateStr: string, totalDays: number) {
  const d = new Date(dateStr + 'T12:00:00Z')
  if (totalDays <= 7) return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const PRESETS = [
  { label: "Aujourd'hui", from: today, to: today },
  { label: 'Semaine', from: startOfWeek, to: today },
  { label: 'Mois', from: startOfMonth, to: today },
  { label: 'Année', from: startOfYear, to: today },
  { label: '30j', from: () => daysAgo(30), to: today },
]

const CHART_TYPES = [
  { label: 'Courbe', value: 'area' as const },
  { label: 'Barres', value: 'bar' as const },
]

// ─── Merge daily data from both sources onto the same dates ───────────────────

function mergeDaily(
  shopify: DailyRevenue[],
  sumup: SumUpDay[],
  showShopify: boolean,
  showSumup: boolean
): { label: string; date: string; shopify: number; sumup: number; total: number }[] {
  const allDates = new Set([...shopify.map((d) => d.date), ...sumup.map((d) => d.date)])
  const shopifyMap = new Map(shopify.map((d) => [d.date, d.revenue]))
  const sumupMap = new Map(sumup.map((d) => [d.date, d.revenue]))

  return Array.from(allDates)
    .sort()
    .map((date) => {
      const s = showShopify ? (shopifyMap.get(date) ?? 0) : 0
      const u = showSumup ? (sumupMap.get(date) ?? 0) : 0
      return { date, label: '', shopify: s, sumup: u, total: s + u }
    })
}

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
  initialSumupDaily?: SumUpDay[]
}

export function RevenueChart({ initialDaily, initialTop, initialSumupDaily = [] }: Props) {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area')
  const [activePreset, setActivePreset] = useState<number>(4) // 30j default
  const [customFrom, setCustomFrom] = useState(daysAgo(30))
  const [customTo, setCustomTo] = useState(today())
  const [showCustom, setShowCustom] = useState(false)
  const [daily, setDaily] = useState<DailyRevenue[]>(initialDaily)
  const [sumupDaily, setSumupDaily] = useState<SumUpDay[]>(initialSumupDaily)
  const [top, setTop] = useState<TopProduct[]>(initialTop)
  const [loading, setLoading] = useState(false)
  const [showShopify, setShowShopify] = useState(true)
  const [showSumup, setShowSumup] = useState(true)

  const fetchData = useCallback(async (from: string, to: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/revenue?from=${from}&to=${to}`)
      const json = await res.json()
      setDaily(json.daily ?? [])
      setTop(json.top ?? [])
      setSumupDaily(json.sumupDaily ?? [])
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

  const merged = useMemo(
    () => mergeDaily(daily, sumupDaily, showShopify, showSumup),
    [daily, sumupDaily, showShopify, showSumup]
  )

  const chartData = useMemo(
    () => merged.map((d) => ({ ...d, label: formatLabel(d.date, totalDays) })),
    [merged, totalDays]
  )

  const totalShopify = useMemo(() => daily.reduce((s, d) => s + d.revenue, 0), [daily])
  const totalSumup = useMemo(() => sumupDaily.reduce((s, d) => s + d.revenue, 0), [sumupDaily])
  const displayTotal = (showShopify ? totalShopify : 0) + (showSumup ? totalSumup : 0)

  const yFormatter = (v: number) => formatEUR(v)
  const tooltipFormatter = (value: unknown, name: unknown) => {
    const labels: Record<string, string> = { shopify: 'Shopify', sumup: 'SumUp', total: 'Total' }
    const key = String(name ?? '')
    return [formatEUR(Number(value ?? 0)), labels[key] ?? key]
  }

  const empty = chartData.every((d) => d.shopify === 0 && d.sumup === 0)
  const dataKey = showShopify && showSumup ? 'total' : showShopify ? 'shopify' : 'sumup'

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Chiffre d&apos;affaires
            </p>
            <p className="mt-1 text-3xl font-bold text-[#1D164E]">
              {loading ? '…' : formatEUR(displayTotal)}
            </p>
            {/* Source breakdown */}
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => setShowShopify((v) => !v)}
                className={`flex items-center gap-1.5 text-xs font-medium transition-opacity ${showShopify ? 'opacity-100' : 'opacity-30'}`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#1D164E] inline-block" />
                Shopify{' '}
                {totalShopify > 0 && (
                  <span className="text-gray-400">{formatEUR(totalShopify)}</span>
                )}
              </button>
              <button
                onClick={() => setShowSumup((v) => !v)}
                className={`flex items-center gap-1.5 text-xs font-medium transition-opacity ${showSumup ? 'opacity-100' : 'opacity-30'}`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#C4714A] inline-block" />
                SumUp{' '}
                {totalSumup > 0 && <span className="text-gray-400">{formatEUR(totalSumup)}</span>}
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2">
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
            Aucune donnée pour cette période
          </div>
        ) : (
          <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
            <ResponsiveContainer width="100%" height={240}>
              {chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradShopify" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1D164E" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1D164E" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradSumup" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C4714A" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#C4714A" stopOpacity={0} />
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
                    width={70}
                  />
                  <Tooltip
                    formatter={tooltipFormatter}
                    labelStyle={{ color: '#1D164E', fontWeight: 600 }}
                    contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0', fontSize: 13 }}
                  />
                  {showShopify && showSumup ? (
                    <>
                      <Area
                        type="monotone"
                        dataKey="shopify"
                        stroke="#1D164E"
                        strokeWidth={2}
                        fill="url(#gradShopify)"
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="sumup"
                        stroke="#C4714A"
                        strokeWidth={2}
                        fill="url(#gradSumup)"
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </>
                  ) : (
                    <Area
                      type="monotone"
                      dataKey={dataKey}
                      stroke={showShopify ? '#1D164E' : '#C4714A'}
                      strokeWidth={2}
                      fill={showShopify ? 'url(#gradShopify)' : 'url(#gradSumup)'}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  )}
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
                    width={70}
                  />
                  <Tooltip
                    formatter={tooltipFormatter}
                    labelStyle={{ color: '#1D164E', fontWeight: 600 }}
                    contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0', fontSize: 13 }}
                    cursor={{ fill: '#1D164E10' }}
                  />
                  {showShopify && showSumup ? (
                    <>
                      <Bar dataKey="shopify" fill="#1D164E" radius={[4, 4, 0, 0]} stackId="a" />
                      <Bar dataKey="sumup" fill="#C4714A" radius={[4, 4, 0, 0]} stackId="a" />
                    </>
                  ) : (
                    <Bar
                      dataKey={dataKey}
                      fill={showShopify ? '#1D164E' : '#C4714A'}
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top products */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">
          Top 5 produits Shopify — même période
        </p>
        <TopProducts items={top} />
      </div>
    </div>
  )
}
