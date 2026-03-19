'use client'

import { useState, useMemo } from 'react'
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
  from: string
  to: string
  loading?: boolean
}

export function RevenueChart({
  initialDaily,
  initialTop,
  initialSumupDaily = [],
  from,
  to,
  loading = false,
}: Props) {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area')
  const [showShopify, setShowShopify] = useState(true)
  const [showSumup, setShowSumup] = useState(true)

  const totalDays = useMemo(() => {
    const diff = new Date(to).getTime() - new Date(from).getTime()
    return Math.ceil(diff / 86400000) + 1
  }, [from, to])

  const merged = useMemo(
    () => mergeDaily(initialDaily, initialSumupDaily, showShopify, showSumup),
    [initialDaily, initialSumupDaily, showShopify, showSumup]
  )

  const chartData = useMemo(
    () => merged.map((d) => ({ ...d, label: formatLabel(d.date, totalDays) })),
    [merged, totalDays]
  )

  const totalShopify = useMemo(
    () => initialDaily.reduce((s, d) => s + d.revenue, 0),
    [initialDaily]
  )
  const totalSumup = useMemo(
    () => initialSumupDaily.reduce((s, d) => s + d.revenue, 0),
    [initialSumupDaily]
  )
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

          {/* Chart type toggle */}
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
        <TopProducts items={initialTop} />
      </div>
    </div>
  )
}
