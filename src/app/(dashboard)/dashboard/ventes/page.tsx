import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { VentesPeriodControls } from './period-controls'
import { VentesFilteredView } from './filtered-view'
import type { ByDayEntry } from '@/components/dashboard/sumup-revenue-chart'
import type { ByProductEntry } from '@/components/dashboard/sumup-top-services'
import type { PayoutEntry } from '@/components/dashboard/sumup-payouts'
import type { SumUpTransaction } from '@/lib/sumup'

export const dynamic = 'force-dynamic'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SumUpCacheRow {
  period: string
  transactions: SumUpTransaction[]
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

function defaultDateRange(): { from: string; to: string } {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const to = now.toISOString().slice(0, 10)
  return { from, to }
}

function formatDateRange(from: string, to: string): string {
  const f = new Date(from).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const t = new Date(to).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return `${f} — ${t}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>
}

const dateRe = /^\d{4}-\d{2}-\d{2}$/

export default async function VentesPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const resolved = await searchParams
  const defaults = defaultDateRange()

  const from = resolved.from && dateRe.test(resolved.from) ? resolved.from : defaults.from
  const to = resolved.to && dateRe.test(resolved.to) ? resolved.to : defaults.to

  const period = `${from}_${to}`

  // Read from cache
  const { data: cacheRow, error } = await supabaseAdmin
    .from('sumup_cache')
    .select('*')
    .eq('period', period)
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
        <VentesPeriodControls currentFrom={from} currentTo={to} />
      </div>

      {/* Period label */}
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
        {formatDateRange(from, to)}
      </p>

      {!hasData ? (
        <EmptyState from={from} to={to} />
      ) : (
        <VentesFilteredView
          byDay={cacheRow.by_day ?? []}
          byProduct={cacheRow.by_product ?? []}
          byPaymentType={cacheRow.by_payment_type ?? []}
          payouts={cacheRow.payouts ?? []}
          totalRevenue={cacheRow.total_revenue}
          transactionCount={cacheRow.transaction_count}
          avgTicket={cacheRow.avg_ticket}
          refundRate={cacheRow.refund_rate}
          transactions={cacheRow.transactions ?? []}
        />
      )}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ from, to }: { from: string; to: string }) {
  return (
    <div className="bg-white rounded-2xl p-12 shadow-sm flex flex-col items-center gap-4 text-center">
      <p className="text-lg font-semibold text-[#1D164E]">Aucune donnée pour cette période</p>
      <p className="text-sm text-gray-400">
        Les données SumUp doivent être synchronisées avant d&apos;apparaître ici.
      </p>
      <form action={`/api/dashboard/sumup/sync?from=${from}&to=${to}`} method="POST">
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
