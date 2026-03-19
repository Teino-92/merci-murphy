import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { getRevenueStats, getDailyRevenue, getTopProducts } from '@/lib/shopify-admin'
import { getLeads, getProfiles, supabaseAdmin } from '@/lib/supabase-admin'
import { StatCard } from '@/components/dashboard/stat-card'
import { DashboardMain } from './dashboard-main'

export const dynamic = 'force-dynamic'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount)
}

function currentMonthRange() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const to = now.toISOString().slice(0, 10)
  return { from, to }
}

interface SumUpCacheRow {
  by_day: { date: string; revenue: number; count: number }[]
  by_product: { name: string; category: string; revenue: number; quantity: number }[]
  payouts: {
    id: string
    date: string
    amount: number
    fee: number
    net: number
    status: string
    currency: string
  }[]
  total_revenue: number
  transaction_count: number
  avg_ticket: number
  refund_rate: number
}

async function getSumUpData(from: string, to: string) {
  try {
    const { data: rows } = await supabaseAdmin
      .from('sumup_cache')
      .select('*')
      .order('refreshed_at', { ascending: false })
    if (!rows?.length) return null

    // Pick the best single row to avoid double-counting overlapping synced periods.
    // Priority: exact match > row whose period fully contains the range > most recent.
    const best =
      rows.find((r) => r.period === `${from}_${to}`) ??
      rows.find((r) => {
        const [rFrom, rTo] = r.period.split('_')
        return rFrom <= from && rTo >= to
      }) ??
      rows[0]

    const byDay = ((best.by_day ?? []) as SumUpCacheRow['by_day'])
      .filter((e) => e.date >= from && e.date <= to)
      .sort((a, b) => a.date.localeCompare(b.date))

    const totalRevenue = byDay.reduce((s, d) => s + d.revenue, 0)
    const byProduct = [...(best.by_product ?? [])].sort((a, b) => b.revenue - a.revenue)

    return {
      byDay,
      byProduct,
      payouts: (best.payouts ?? []) as SumUpCacheRow['payouts'],
      totalRevenue,
      transactionCount: best.transaction_count ?? 0,
      avgTicket: best.avg_ticket ?? 0,
      refundRate: best.refund_rate ?? 0,
      refreshedAt: (best.refreshed_at as string | null) ?? null,
    }
  } catch {
    return null
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { from, to } = currentMonthRange()

  const [revenue, dailyRevenue, topProducts, leads, profiles, sumup] = await Promise.all([
    getRevenueStats(),
    getDailyRevenue(),
    getTopProducts(),
    getLeads(),
    getProfiles(),
    getSumUpData(from, to),
  ])

  const newLeads = leads.filter((l) => l.status === 'new').length
  const confirmedLeads = leads.filter((l) => l.status === 'confirmed').length
  const totalCombined = revenue.totalRevenue + (sumup?.totalRevenue ?? 0)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-[#1D164E]">Vue d&apos;ensemble</h1>
      </div>

      {/* Combined KPIs — current month */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Mois en cours
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total combiné"
            value={totalCombined > 0 ? formatCurrency(totalCombined, 'EUR') : '—'}
            highlight={totalCombined > 0}
            sub="Shopify + SumUp"
          />
          <StatCard
            label="SumUp (boutique)"
            value={
              sumup && sumup.totalRevenue > 0 ? formatCurrency(sumup.totalRevenue, 'EUR') : '—'
            }
            sub={!sumup ? 'Aucune donnée — cliquez Actualiser' : 'Paiements en boutique'}
          />
          <StatCard
            label="Shopify (en ligne)"
            value={
              revenue.totalRevenue > 0
                ? formatCurrency(revenue.totalRevenue, revenue.currency)
                : '—'
            }
            sub="Boutique en ligne"
          />
          <StatCard
            label="Ticket moyen SumUp"
            value={sumup && sumup.avgTicket > 0 ? formatCurrency(sumup.avgTicket, 'EUR') : '—'}
            sub={
              sumup && sumup.transactionCount > 0
                ? `${sumup.transactionCount} transactions`
                : undefined
            }
          />
        </div>
      </section>

      {/* Main analytics — interactive */}
      <DashboardMain
        initialFrom={from}
        initialTo={to}
        initialShopifyDaily={dailyRevenue}
        initialShopifyTop={topProducts}
        initialSumup={sumup}
      />

      {/* CRM stats */}
      <section className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Clients &amp; réservations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Profils clients" value={String(profiles.length)} />
          <StatCard label="Nouvelles demandes" value={String(newLeads)} highlight={newLeads > 0} />
          <StatCard label="Confirmées" value={String(confirmedLeads)} />
        </div>
      </section>
    </div>
  )
}
