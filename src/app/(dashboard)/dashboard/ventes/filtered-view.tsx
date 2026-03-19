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

  // Service options derived from byProduct (already sorted by revenue)
  const serviceOptions = useMemo(() => byProduct.map((p) => p.name), [byProduct])

  // When a service is selected, filter transactions by product_summary match
  const filtered = useMemo(() => {
    if (service === ALL) return null

    const matchingTxs = transactions.filter((tx) => {
      const summary = (tx.product_summary ?? '').toLowerCase()
      const target = service.toLowerCase()
      // Match normalized name variants
      return summary.includes(target) || normalizeMatch(summary, service)
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
    const productEntry = byProduct.find((p) => p.name === service)
    const filteredByProduct: ByProductEntry[] = productEntry ? [productEntry] : []

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
          Filtrer par service
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setService(ALL)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              service === ALL
                ? 'bg-[#1D164E] text-white border-[#1D164E]'
                : 'text-gray-500 border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            Tous
          </button>
          {serviceOptions.map((name) => (
            <button
              key={name}
              onClick={() => setService(name === service ? ALL : name)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                service === name
                  ? 'bg-[#C4714A] text-white border-[#C4714A]'
                  : 'text-gray-500 border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
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

// ─── normalizeMatch ───────────────────────────────────────────────────────────
// Maps canonical service names back to product_summary patterns

function normalizeMatch(summary: string, canonicalName: string): boolean {
  const n = canonicalName.toLowerCase()
  if (n === 'toilettage maison poilus') return summary.includes('maison poilus')
  if (n === 'acompte toilettage') return summary.includes('acompte toilettage')
  if (n === 'acompte bains') return summary.includes('acompte bains')
  if (n === 'acompte crèche')
    return summary.includes('acompte creche') || summary.includes('acompte crèche')
  if (n === 'acompte éducation')
    return summary.includes('acompte education') || summary.includes('acompte éducation')
  if (n === 'acompte massage') return summary.includes('acompte massage')
  if (n === 'acompte balnéo')
    return summary.includes('acompte balneo') || summary.includes('acompte balnéo')
  if (n === 'bains') return summary.includes('bains') && !summary.includes('acompte')
  if (n === 'crèche')
    return (
      (summary.includes('creche') || summary.includes('crèche')) && !summary.includes('acompte')
    )
  if (n === 'éducation')
    return (
      (summary.includes('education') || summary.includes('éducation')) &&
      !summary.includes('acompte')
    )
  if (n === 'ostéopathie') return summary.includes('osteo') || summary.includes('ostéo')
  if (n === 'massage') return summary.includes('massage') && !summary.includes('acompte')
  if (n === 'toilettage')
    return (
      summary.includes('toilettage') &&
      !summary.includes('acompte') &&
      !summary.includes('maison poilus')
    )
  return false
}
