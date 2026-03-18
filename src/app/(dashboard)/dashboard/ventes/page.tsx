import { Suspense } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { StatCard } from '@/components/dashboard/stat-card'
import { SumUpRevenueChart } from '@/components/dashboard/sumup-revenue-chart'
import { SumUpTopServices } from '@/components/dashboard/sumup-top-services'
import { SumUpPayouts } from '@/components/dashboard/sumup-payouts'
import { VentesPeriodControls } from './period-controls'
import type { ByDayEntry } from '@/components/dashboard/sumup-revenue-chart'
import type { ByProductEntry } from '@/components/dashboard/sumup-top-services'
import type { PayoutEntry } from '@/components/dashboard/sumup-payouts'

export const dynamic = 'force-dynamic'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SumUpCacheRow {
  period: string
  by_day: ByDayEntry[]
  by_product: ByProductEntry[]
  by_payment_type: { type: string; count: number; revenue: number }[]
  payouts: PayoutEntry[]
  total_revenue: number
  transaction_count: number
  avg_ticket: number
  refund_rate: number
  refreshed_at: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7)
}

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

function formatPeriodLabel(period: string): string {
  const [yearStr, monthStr] = period.split('-')
  const d = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1)
  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ period?: string }>
}

export default async function VentesPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const resolvedParams = await searchParams
  const period = resolvedParams.period ?? currentPeriod()

  // Validate period format
  const validPeriod = /^\d{4}-\d{2}$/.test(period) ? period : currentPeriod()

  // Read from cache
  const { data: cacheRow, error } = await supabaseAdmin
    .from('sumup_cache')
    .select('*')
    .eq('period', validPeriod)
    .maybeSingle<SumUpCacheRow>()

  const hasData = !error && cacheRow !== null

  const refreshedAt = cacheRow?.refreshed_at
    ? new Date(cacheRow.refreshed_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1D164E]">Ventes — SumUp</h1>
          {refreshedAt && <p className="text-xs text-gray-400 mt-1">Actualisé le {refreshedAt}</p>}
        </div>
        <VentesPeriodControls currentPeriod={validPeriod} />
      </div>

      {/* Period label */}
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
        {formatPeriodLabel(validPeriod)}
      </p>

      {!hasData ? (
        <EmptyState period={validPeriod} />
      ) : (
        <Suspense fallback={<div className="text-gray-400 text-sm">Chargement…</div>}>
          {/* KPI stat cards */}
          <section className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Chiffre d'affaires"
                value={formatEUR(cacheRow.total_revenue)}
                highlight={cacheRow.total_revenue > 0}
              />
              <StatCard
                label="Ticket moyen"
                value={cacheRow.avg_ticket > 0 ? formatEUR(cacheRow.avg_ticket) : '—'}
              />
              <StatCard label="Transactions" value={String(cacheRow.transaction_count)} />
              <StatCard
                label="Taux de remboursement"
                value={formatPercent(cacheRow.refund_rate)}
                sub={cacheRow.refund_rate === 0 ? 'Aucun remboursement' : undefined}
              />
            </div>
          </section>

          {/* Revenue chart */}
          <section className="mb-6">
            <SumUpRevenueChart byDay={cacheRow.by_day ?? []} />
          </section>

          {/* Top services */}
          <section className="mb-6">
            <SumUpTopServices byProduct={cacheRow.by_product ?? []} />
          </section>

          {/* Payouts */}
          <section className="mb-6">
            <SumUpPayouts payouts={cacheRow.payouts ?? []} />
          </section>
        </Suspense>
      )}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ period }: { period: string }) {
  return (
    <div className="bg-white rounded-2xl p-12 shadow-sm flex flex-col items-center gap-4 text-center">
      <p className="text-lg font-semibold text-[#1D164E]">Aucune donnée pour cette période</p>
      <p className="text-sm text-gray-400">
        Les données SumUp doivent être synchronisées avant d&apos;apparaître ici.
      </p>
      <form action={`/api/dashboard/sumup/sync?period=${period}`} method="POST">
        <button
          type="submit"
          className="mt-2 bg-[#1D164E] text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-[#1D164E]/90 transition-colors"
        >
          Actualiser les données
        </button>
      </form>
    </div>
  )
}
