import { getRevenueStats, getDailyRevenue, getTopProducts } from '@/lib/shopify-admin'
import { getLeads, getProfiles, supabaseAdmin } from '@/lib/supabase-admin'
import { StatCard } from '@/components/dashboard/stat-card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'

export const dynamic = 'force-dynamic'

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount)
}

interface SumUpCacheDay {
  total_revenue: number
  by_day: { date: string; revenue: number; count: number }[]
}

async function getSumUpCurrentMonth(): Promise<{
  revenue: number
  byDay: { date: string; revenue: number; count: number }[]
}> {
  try {
    const now = new Date()
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    const to = now.toISOString().slice(0, 10)
    // Collect all cache rows and filter by_day entries within the current month
    const { data: rows } = await supabaseAdmin.from('sumup_cache').select('total_revenue,by_day')
    if (!rows || rows.length === 0) return { revenue: 0, byDay: [] }
    const map = new Map<string, number>()
    let totalRevenue = 0
    for (const row of rows as SumUpCacheDay[]) {
      const byDay = row.by_day ?? []
      for (const entry of byDay) {
        if (entry.date >= from && entry.date <= to) {
          const prev = map.get(entry.date) ?? 0
          map.set(entry.date, prev + entry.revenue)
          totalRevenue += entry.revenue - prev // add only the delta to avoid double-counting
        }
      }
    }
    // Recompute totalRevenue cleanly from the map
    totalRevenue = Array.from(map.values()).reduce((s, v) => s + v, 0)
    const byDay = Array.from(map.entries())
      .map(([date, revenue]) => ({ date, revenue, count: 0 }))
      .sort((a, b) => a.date.localeCompare(b.date))
    return { revenue: totalRevenue, byDay }
  } catch {
    return { revenue: 0, byDay: [] }
  }
}

export default async function DashboardPage() {
  const [revenue, dailyRevenue, topProducts, leads, profiles, sumup] = await Promise.all([
    getRevenueStats(),
    getDailyRevenue(),
    getTopProducts(),
    getLeads(),
    getProfiles(),
    getSumUpCurrentMonth(),
  ])

  const newLeads = leads.filter((l) => l.status === 'new').length
  const confirmedLeads = leads.filter((l) => l.status === 'confirmed').length

  const totalCombined = revenue.totalRevenue + sumup.revenue

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1D164E] mb-8">Vue d&apos;ensemble</h1>

      {/* Revenus combinés */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Revenus combinés — mois en cours
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            label="SumUp (boutique)"
            value={sumup.revenue > 0 ? formatCurrency(sumup.revenue, 'EUR') : '—'}
            sub={sumup.revenue === 0 ? 'Actualiser dans Ventes' : 'Paiements en boutique'}
          />
          <StatCard
            label="Total"
            value={totalCombined > 0 ? formatCurrency(totalCombined, 'EUR') : '—'}
            highlight={totalCombined > 0}
            sub="Shopify + SumUp"
          />
        </div>
      </section>

      {/* Shopify stat cards */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Shopify — 30 derniers jours
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Chiffre d'affaires"
            value={
              revenue.totalRevenue > 0
                ? formatCurrency(revenue.totalRevenue, revenue.currency)
                : '—'
            }
            sub={revenue.totalRevenue === 0 ? 'Token Admin requis' : undefined}
          />
          <StatCard
            label="Commandes"
            value={revenue.ordersCount > 0 ? String(revenue.ordersCount) : '—'}
          />
          <StatCard
            label="Panier moyen"
            value={
              revenue.avgOrderValue > 0
                ? formatCurrency(revenue.avgOrderValue, revenue.currency)
                : '—'
            }
          />
        </div>
      </section>

      {/* Chart + top products */}
      <section className="mb-10">
        <RevenueChart
          initialDaily={dailyRevenue}
          initialTop={topProducts}
          initialSumupDaily={sumup.byDay}
        />
      </section>

      {/* CRM stats */}
      <section>
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
