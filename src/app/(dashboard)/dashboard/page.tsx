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
    const { data: rows } = await supabaseAdmin.from('sumup_cache').select('*')
    if (!rows?.length) return null

    // Merge by_day entries within range across all cache rows
    const dayMap = new Map<string, number>()
    const productMap = new Map<
      string,
      { name: string; category: string; revenue: number; quantity: number }
    >()
    let latestPayouts: SumUpCacheRow['payouts'] = []
    let latestRefreshedAt: string | null = null

    for (const row of rows as (SumUpCacheRow & { refreshed_at?: string })[]) {
      // by_day
      for (const entry of row.by_day ?? []) {
        if (entry.date >= from && entry.date <= to) {
          dayMap.set(entry.date, (dayMap.get(entry.date) ?? 0) + entry.revenue)
        }
      }
      // by_product — merge, prefer most recent for same key
      for (const p of row.by_product ?? []) {
        const key = p.name
        const existing = productMap.get(key)
        if (!existing) {
          productMap.set(key, { ...p })
        } else {
          productMap.set(key, {
            ...existing,
            revenue: existing.revenue + p.revenue,
            quantity: existing.quantity + p.quantity,
          })
        }
      }
      // payouts — use the most recently refreshed row
      if (!latestRefreshedAt || (row.refreshed_at && row.refreshed_at > latestRefreshedAt)) {
        latestRefreshedAt = row.refreshed_at ?? null
        latestPayouts = row.payouts ?? []
      }
    }

    const byDay = Array.from(dayMap.entries())
      .map(([date, revenue]) => ({ date, revenue, count: 0 }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const totalRevenue = byDay.reduce((s, d) => s + d.revenue, 0)
    const byProduct = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue)

    // Approximate avg_ticket and refund_rate from the matching cache row
    const exactRow = (rows as (SumUpCacheRow & { period: string })[]).find(
      (r) => r.period === `${from}_${to}`
    )

    return {
      byDay,
      byProduct,
      payouts: latestPayouts,
      totalRevenue,
      transactionCount: exactRow?.transaction_count ?? 0,
      avgTicket:
        exactRow?.avg_ticket ?? (totalRevenue > 0 ? totalRevenue / Math.max(byDay.length, 1) : 0),
      refundRate: exactRow?.refund_rate ?? 0,
      refreshedAt: latestRefreshedAt,
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
