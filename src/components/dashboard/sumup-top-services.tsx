'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ByProductEntry {
  name: string
  revenue: number
  quantity: number
}

interface Props {
  byProduct: ByProductEntry[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatEUR(v: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(v)
}

function truncate(s: string, max = 24): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SumUpTopServices({ byProduct }: Props) {
  const top10 = useMemo(() => byProduct.slice(0, 10), [byProduct])

  const chartData = useMemo(() => top10.map((p) => ({ ...p, label: truncate(p.name) })), [top10])

  const empty = top10.length === 0

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">
        Top services / produits — par CA
      </p>

      {empty ? (
        <div className="h-64 flex items-center justify-center text-gray-300 text-sm">
          Aucune donnée pour cette période
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(top10.length * 40, 200)}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v: number) => formatEUR(v)}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={130}
              tick={{ fontSize: 11, fill: '#374151' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: unknown) => [formatEUR(Number(value ?? 0)), 'CA']}
              labelStyle={{ color: '#1D164E', fontWeight: 600 }}
              contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0', fontSize: 13 }}
              cursor={{ fill: '#1D164E08' }}
            />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={i === 0 ? '#C4714A' : i === 1 ? '#1D164E' : '#e5e7eb'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
