import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { isAdminEmail } from '@/lib/auth-role'
import { getRevenueStats, getDailyRevenue, getTopProducts } from '@/lib/shopify-admin'
import { getLeads, getProfiles, supabaseAdmin } from '@/lib/supabase-admin'
import { StatCard } from '@/components/dashboard/stat-card'
import { DashboardMain } from './dashboard-main'
import type { VisitsStats } from './dashboard-main'

export const dynamic = 'force-dynamic'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount)
}

function localDateStr(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function currentMonthRange() {
  const now = new Date()
  const from = localDateStr(new Date(now.getFullYear(), now.getMonth(), 1))
  const to = localDateStr(now)
  return { from, to }
}

async function getVisitsStats(from: string, to: string): Promise<VisitsStats> {
  try {
    const { data } = await supabaseAdmin
      .from('visits')
      .select('service, price, date')
      .not('price', 'is', null)
      .gte('date', from)
      .lte('date', to)

    const rows = data ?? []
    const serviceMap = new Map<string, { revenue: number; count: number }>()
    let totalRevenue = 0
    let visitCount = 0

    for (const row of rows) {
      const price = Number(row.price ?? 0)
      totalRevenue += price
      visitCount++
      const existing = serviceMap.get(row.service) ?? { revenue: 0, count: 0 }
      serviceMap.set(row.service, {
        revenue: existing.revenue + price,
        count: existing.count + 1,
      })
    }

    const byService = Array.from(serviceMap.entries())
      .map(([service, { revenue, count }]) => ({ service, revenue, count }))
      .sort((a, b) => b.revenue - a.revenue)

    return {
      totalRevenue,
      visitCount,
      avgTicket: visitCount > 0 ? totalRevenue / visitCount : 0,
      byService,
    }
  } catch {
    return { totalRevenue: 0, visitCount: 0, avgTicket: 0, byService: [] }
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (!isAdminEmail(user.email)) redirect('/dashboard/reservations/new')

  const { from, to } = currentMonthRange()

  const [revenue, dailyRevenue, topProducts, leads, profiles, visits] = await Promise.all([
    getRevenueStats(),
    getDailyRevenue(),
    getTopProducts(),
    getLeads(),
    getProfiles(),
    getVisitsStats(from, to),
  ])

  const newLeads = leads.filter((l) => l.status === 'new').length
  const confirmedLeads = leads.filter((l) => l.status === 'confirmed').length

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-[#4F6072]">Vue d&apos;ensemble</h1>
      </div>

      {/* KPIs — current month */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Mois en cours
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="CA services"
            value={visits.totalRevenue > 0 ? formatCurrency(visits.totalRevenue, 'EUR') : '—'}
            highlight={visits.totalRevenue > 0}
            sub="Visites enregistrées"
          />
          <StatCard
            label="Visites"
            value={visits.visitCount > 0 ? String(visits.visitCount) : '—'}
            sub="Ce mois-ci"
          />
          <StatCard
            label="CA Shopify"
            value={
              revenue.totalRevenue > 0
                ? formatCurrency(revenue.totalRevenue, revenue.currency)
                : '—'
            }
            sub="Boutique en ligne"
          />
          <StatCard
            label="Ticket moyen"
            value={visits.avgTicket > 0 ? formatCurrency(visits.avgTicket, 'EUR') : '—'}
            sub={
              visits.visitCount > 0
                ? `${visits.visitCount} visite${visits.visitCount > 1 ? 's' : ''}`
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
        initialVisits={visits}
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
