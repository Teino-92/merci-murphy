'use client'

import { useState, useMemo } from 'react'
import { StatCard } from '@/components/dashboard/stat-card'
import { SumUpRevenueChart } from '@/components/dashboard/sumup-revenue-chart'
import { SumUpTopServices } from '@/components/dashboard/sumup-top-services'
import { SumUpPayouts } from '@/components/dashboard/sumup-payouts'
import type { ByDayEntry } from '@/components/dashboard/sumup-revenue-chart'
import type { ByProductEntry } from '@/components/dashboard/sumup-top-services'
import type { PayoutEntry } from '@/components/dashboard/sumup-payouts'
import type { SumUpTransaction } from '@/lib/sumup'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  byDay: ByDayEntry[]
  byProduct: ByProductEntry[]
  byPaymentType: { type: string; count: number; revenue: number }[]
  payouts: PayoutEntry[]
  totalRevenue: number
  transactionCount: number
  avgTicket: number
  refundRate: number
  transactions: SumUpTransaction[]
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

// Derive by_day from a filtered set of transactions
function deriveByDay(txs: SumUpTransaction[]): ByDayEntry[] {
  const map = new Map<string, { revenue: number; count: number }>()
  for (const tx of txs) {
    if (tx.status !== 'SUCCESSFUL' && tx.status !== 'REFUNDED') continue
    const day = tx.timestamp.slice(0, 10)
    const entry = map.get(day) ?? { revenue: 0, count: 0 }
    entry.revenue += tx.status === 'SUCCESSFUL' ? (tx.amount ?? 0) : 0
    entry.count += 1
    map.set(day, entry)
  }
  return Array.from(map.entries())
    .map(([date, v]) => ({ date, revenue: v.revenue, count: v.count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

// ─── Component ────────────────────────────────────────────────────────────────

const ALL = '__all__'

export function VentesFilteredView({
  byDay,
  byProduct,
  payouts,
  totalRevenue,
  transactionCount,
  avgTicket,
  refundRate,
  transactions,
}: Props) {
  const [service, setService] = useState<string>(ALL)

  // All unique normalized service names from every transaction (not just top 10)
  const serviceOptions = useMemo(() => {
    const seen = new Map<string, number>() // name → total revenue
    for (const tx of transactions) {
      if (tx.status !== 'SUCCESSFUL' && tx.status !== 'REFUNDED') continue
      if (!tx.product_summary) continue
      const name = normalizeServiceName(tx.product_summary)
      seen.set(name, (seen.get(name) ?? 0) + (tx.status === 'SUCCESSFUL' ? (tx.amount ?? 0) : 0))
    }
    return Array.from(seen.entries())
      .sort((a, b) => b[1] - a[1]) // sort by revenue desc
      .map(([name]) => name)
  }, [transactions])

  // When a service is selected, filter transactions by product_summary match
  const filtered = useMemo(() => {
    if (service === ALL) return null

    const matchingTxs = transactions.filter((tx) => {
      if (!tx.product_summary) return false
      return normalizeServiceName(tx.product_summary) === service
    })

    const filteredByDay = deriveByDay(matchingTxs)

    const totalRev = matchingTxs
      .filter((tx) => tx.status === 'SUCCESSFUL')
      .reduce((sum, tx) => sum + (tx.amount ?? 0), 0)

    const count = matchingTxs.filter(
      (tx) => tx.status === 'SUCCESSFUL' || tx.status === 'REFUNDED'
    ).length

    const avg = count > 0 ? totalRev / count : 0

    const refunded = matchingTxs
      .filter((tx) => tx.status === 'REFUNDED')
      .reduce((sum, tx) => sum + (tx.refunded_amount ?? tx.amount ?? 0), 0)

    const rate = totalRev > 0 ? refunded / totalRev : 0

    // Product breakdown for this service
    const filteredByProduct: ByProductEntry[] =
      totalRev > 0 ? [{ name: service, revenue: totalRev, quantity: count }] : []

    return { filteredByDay, totalRev, count, avg, rate, filteredByProduct }
  }, [service, transactions, byProduct])

  const displayByDay = filtered ? filtered.filteredByDay : byDay
  const displayByProduct = filtered ? filtered.filteredByProduct : byProduct
  const displayTotalRevenue = filtered ? filtered.totalRev : totalRevenue
  const displayCount = filtered ? filtered.count : transactionCount
  const displayAvg = filtered ? filtered.avg : avgTicket
  const displayRate = filtered ? filtered.rate : refundRate

  return (
    <>
      {/* Service filter */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 shrink-0">
          Service
        </span>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white text-sm text-gray-700 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1D164E] min-w-[200px]"
        >
          <option value={ALL}>Tous les services</option>
          {serviceOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        {service !== ALL && (
          <button
            onClick={() => setService(ALL)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* KPI stat cards */}
      <section className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Chiffre d'affaires"
            value={formatEUR(displayTotalRevenue)}
            highlight={displayTotalRevenue > 0}
          />
          <StatCard label="Ticket moyen" value={displayAvg > 0 ? formatEUR(displayAvg) : '—'} />
          <StatCard label="Transactions" value={String(displayCount)} />
          <StatCard
            label="Taux de remboursement"
            value={formatPercent(displayRate)}
            sub={displayRate === 0 ? 'Aucun remboursement' : undefined}
          />
        </div>
      </section>

      {/* Revenue chart */}
      <section className="mb-6">
        <SumUpRevenueChart byDay={displayByDay} />
      </section>

      {/* Top services */}
      <section className="mb-6">
        <SumUpTopServices byProduct={displayByProduct} />
      </section>

      {/* Payouts — always global */}
      <section className="mb-6">
        <SumUpPayouts payouts={payouts} />
      </section>
    </>
  )
}

// ─── normalizeServiceName ─────────────────────────────────────────────────────
// Mirrors server-side normalizeServiceName in sync/route.ts

function normalizeServiceName(summary: string): string {
  const s = summary.trim().toLowerCase()
  if (s.includes('maison poilus')) return 'Toilettage maison POILUS'
  if (s.includes('acompte toilettage')) return 'Acompte toilettage'
  if (s.includes('acompte bains')) return 'Acompte bains'
  if (s.includes('acompte creche') || s.includes('acompte crèche')) return 'Acompte crèche'
  if (s.includes('acompte education') || s.includes('acompte éducation')) return 'Acompte éducation'
  if (s.includes('acompte massage')) return 'Acompte massage'
  if (s.includes('acompte balnéo') || s.includes('acompte balneo')) return 'Acompte balnéo'
  if (s.includes('bains')) return 'Bains'
  if (s.includes('creche') || s.includes('crèche')) return 'Crèche'
  if (s.includes('education') || s.includes('éducation')) return 'Éducation'
  if (s.includes('osteo') || s.includes('ostéo')) return 'Ostéopathie'
  if (s.includes('massage')) return 'Massage'
  if (s.includes('toilettage')) return 'Toilettage'
  return summary.trim()
}
