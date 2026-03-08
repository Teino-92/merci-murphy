import { getRevenueStats, getDailyRevenue, getTopProducts } from '@/lib/shopify-admin'
import { getLeads, getProfiles } from '@/lib/supabase-admin'
import { StatCard } from '@/components/dashboard/stat-card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'

export const dynamic = 'force-dynamic'

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount)
}

export default async function DashboardPage() {
  const [revenue, dailyRevenue, topProducts, leads, profiles] = await Promise.all([
    getRevenueStats(30),
    getDailyRevenue(),
    getTopProducts(),
    getLeads(),
    getProfiles(),
  ])

  const newLeads = leads.filter((l) => l.status === 'new').length
  const confirmedLeads = leads.filter((l) => l.status === 'confirmed').length

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1D164E] mb-8">Vue d&apos;ensemble</h1>

      {/* Stat cards */}
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
        <RevenueChart initialDaily={dailyRevenue} initialTop={topProducts} />
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
