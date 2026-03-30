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
            <span className="text-sm font-medium text-[#4F6072] truncate max-w-[65%]">
              <span className="text-gray-300 mr-2">#{i + 1}</span>
              {item.title}
            </span>
            <div className="text-right shrink-0">
              <span className="text-sm font-bold text-[#4F6072]">{item.quantity} ventes</span>
              <span className="text-xs text-gray-400 ml-2">{formatEUR(item.revenue)}</span>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#4F6072]"
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
  from: string
  to: string
  loading?: boolean
}

export function RevenueChart({ initialDaily, initialTop, from, to, loading = false }: Props) {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area')

  const totalDays = useMemo(() => {
    const diff = new Date(to).getTime() - new Date(from).getTime()
    return Math.ceil(diff / 86400000) + 1
  }, [from, to])

  const chartData = useMemo(
    () =>
      [...initialDaily]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((d) => ({ ...d, label: formatLabel(d.date, totalDays) })),
    [initialDaily, totalDays]
  )

  const totalShopify = useMemo(
    () => initialDaily.reduce((s, d) => s + d.revenue, 0),
    [initialDaily]
  )

  const yFormatter = (v: number) => formatEUR(v)
  const tooltipFormatter = (value: unknown) => [formatEUR(Number(value ?? 0)), 'Shopify']

  const empty = chartData.every((d) => d.revenue === 0)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              CA Shopify (en ligne)
            </p>
            <p className="mt-1 text-3xl font-bold text-[#4F6072]">
              {loading ? '…' : formatEUR(totalShopify)}
            </p>
          </div>

          {/* Chart type toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {CHART_TYPES.map((c) => (
              <button
                key={c.value}
                onClick={() => setChartType(c.value)}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  chartType === c.value
                    ? 'bg-[#4F6072] text-white'
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
                      <stop offset="5%" stopColor="#4F6072" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4F6072" stopOpacity={0} />
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
                    labelStyle={{ color: '#4F6072', fontWeight: 600 }}
                    contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0', fontSize: 13 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4F6072"
                    strokeWidth={2}
                    fill="url(#gradShopify)"
                    dot={false}
                    activeDot={{ r: 4 }}
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
                    width={70}
                  />
                  <Tooltip
                    formatter={tooltipFormatter}
                    labelStyle={{ color: '#4F6072', fontWeight: 600 }}
                    contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0', fontSize: 13 }}
                    cursor={{ fill: '#4F607210' }}
                  />
                  <Bar dataKey="revenue" fill="#4F6072" radius={[4, 4, 0, 0]} />
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
