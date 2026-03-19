'use client'

import { StatCard } from '@/components/dashboard/stat-card'
import { SumUpRevenueChart } from '@/components/dashboard/sumup-revenue-chart'
import { SumUpTopServices } from '@/components/dashboard/sumup-top-services'
import { SumUpPayouts } from '@/components/dashboard/sumup-payouts'
import type { ByDayEntry } from '@/components/dashboard/sumup-revenue-chart'
import type { ByProductEntry } from '@/components/dashboard/sumup-top-services'
import type { PayoutEntry } from '@/components/dashboard/sumup-payouts'

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

// ─── Component ────────────────────────────────────────────────────────────────

export function VentesFilteredView({
  byDay,
  byProduct,
  payouts,
  totalRevenue,
  transactionCount,
  avgTicket,
  refundRate,
}: Props) {
  return (
    <>
      {/* KPI stat cards */}
      <section className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Chiffre d'affaires"
            value={formatEUR(totalRevenue)}
            highlight={totalRevenue > 0}
          />
          <StatCard label="Ticket moyen" value={avgTicket > 0 ? formatEUR(avgTicket) : '—'} />
          <StatCard label="Transactions" value={String(transactionCount)} />
          <StatCard
            label="Taux de remboursement"
            value={formatPercent(refundRate)}
            sub={refundRate === 0 ? 'Aucun remboursement' : undefined}
          />
        </div>
      </section>

      {/* Revenue chart */}
      <section className="mb-6">
        <SumUpRevenueChart byDay={byDay} />
      </section>

      {/* Top services */}
      <section className="mb-6">
        <SumUpTopServices byProduct={byProduct} />
      </section>

      {/* Payouts */}
      <section className="mb-6">
        <SumUpPayouts payouts={payouts} />
      </section>
    </>
  )
}
