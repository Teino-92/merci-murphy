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
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ByDayEntry {
  date: string
  revenue: number
  count: number
}

interface Props {
  byDay: ByDayEntry[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatEUR(v: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(v)
}

function formatLabel(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const METRICS = [
  { label: "Chiffre d'affaires", key: 'revenue' as const },
  { label: 'Transactions', key: 'count' as const },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function SumUpRevenueChart({ byDay }: Props) {
  const [metric, setMetric] = useState<'revenue' | 'count'>('revenue')

  const chartData = useMemo(() => byDay.map((d) => ({ ...d, label: formatLabel(d.date) })), [byDay])

  const total = useMemo(() => chartData.reduce((sum, d) => sum + d[metric], 0), [chartData, metric])

  const yFormatter = (v: number) => (metric === 'revenue' ? formatEUR(v) : String(v))

  const tooltipFormatter = (value: unknown) => {
    const n = Number(value ?? 0)
    return metric === 'revenue' ? formatEUR(n) : `${n} transaction${n > 1 ? 's' : ''}`
  }

  const empty = chartData.length === 0 || chartData.every((d) => d[metric] === 0)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            {METRICS.find((m) => m.key === metric)?.label} — SumUp
          </p>
          <p className="mt-1 text-3xl font-bold text-[#1D164E]">
            {metric === 'revenue' ? formatEUR(total) : total}
          </p>
        </div>

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
      </div>

      {empty ? (
        <div className="h-56 flex items-center justify-center text-gray-300 text-sm">
          Aucune donnée pour cette période
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="sumupGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C4714A" stopOpacity={0.2} />
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
              stroke="#C4714A"
              strokeWidth={2}
              fill="url(#sumupGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#C4714A' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
