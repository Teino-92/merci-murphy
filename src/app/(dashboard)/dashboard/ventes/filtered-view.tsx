'use client'

import { useState, useMemo } from 'react'
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

// ─── productToCategory ────────────────────────────────────────────────────────
// Mirrors server-side productToCategory — used to fill missing category on old cache entries.

function productToCategory(name: string): string {
  const n = name.trim().toLowerCase()
  if (
    n.includes('bain') ||
    n.includes('épilation') ||
    n.includes('epilation') ||
    n.includes('brossage') ||
    n.includes('coupe griffes') ||
    n.includes('soins spécifiques') ||
    n.includes('soins specifiques') ||
    n.includes('atelier comme')
  )
    return 'Spa maison POILUS'
  if (n.includes('toilettage') || n.includes('maison poilus')) return 'Spa maison POILUS'
  if (n.includes('massage') || n.includes('pack 3')) return 'Massage'
  if (n.includes('ostéo') || n.includes('osteo')) return 'Soigner'
  if (
    n.includes('crèche') ||
    n.includes('creche') ||
    n.includes('éducation') ||
    n.includes('education') ||
    n.includes('cours')
  )
    return 'Crèche & Éducation'
  if (n.includes('balnéo') || n.includes('balneo')) return 'Chiller'
  if (n.includes('acompte')) return 'Acomptes'
  return 'Autre'
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
}: Props) {
  const [category, setCategory] = useState<string>(ALL)
  const [product, setProduct] = useState<string>(ALL)

  // Normalize products: fill in category if missing (old cache format)
  const products = useMemo(
    () => byProduct.map((p) => ({ ...p, category: p.category ?? productToCategory(p.name) })),
    [byProduct]
  )

  // Unique categories sorted by total revenue
  const categories = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of products) {
      map.set(p.category, (map.get(p.category) ?? 0) + p.revenue)
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
  }, [products])

  // Products for the selected category, sorted by revenue
  const productsForCategory = useMemo(() => {
    if (category === ALL) return []
    return products.filter((p) => p.category === category).sort((a, b) => b.revenue - a.revenue)
  }, [category, products])

  // Reset product when category changes
  function handleCategoryChange(val: string) {
    setCategory(val)
    setProduct(ALL)
  }

  // Filtered data
  const {
    displayByDay,
    displayByProduct,
    displayTotalRevenue,
    displayCount,
    displayAvg,
    displayRate,
  } = useMemo(() => {
    // No filter
    if (category === ALL) {
      return {
        displayByDay: byDay,
        displayByProduct: products,
        displayTotalRevenue: totalRevenue,
        displayCount: transactionCount,
        displayAvg: avgTicket,
        displayRate: refundRate,
      }
    }

    // Filter by_product entries
    const filtered =
      product !== ALL
        ? products.filter((p) => p.category === category && p.name === product)
        : products.filter((p) => p.category === category)

    const filteredRevenue = filtered.reduce((s, p) => s + p.revenue, 0)
    const filteredQty = filtered.reduce((s, p) => s + p.quantity, 0)
    const filteredAvg = filteredQty > 0 ? filteredRevenue / filteredQty : 0

    // by_day: sum only entries that match — we don't have per-product daily data
    // so we scale by_day proportionally if a specific product is chosen,
    // otherwise show full category day distribution (approximation via ratio)
    const ratio = totalRevenue > 0 ? filteredRevenue / totalRevenue : 0
    const scaledByDay: ByDayEntry[] = byDay.map((d) => ({
      ...d,
      revenue: Math.round(d.revenue * ratio),
      count: Math.round(d.count * ratio),
    }))

    return {
      displayByDay: scaledByDay,
      displayByProduct: filtered,
      displayTotalRevenue: filteredRevenue,
      displayCount: filteredQty,
      displayAvg: filteredAvg,
      displayRate: refundRate, // refund rate stays global (no per-product breakdown)
    }
  }, [category, product, byDay, products, totalRevenue, transactionCount, avgTicket, refundRate])

  const isFiltered = category !== ALL

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Category */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 shrink-0">
            Catégorie
          </span>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white text-sm text-gray-700 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1D164E] min-w-[180px]"
          >
            <option value={ALL}>Toutes</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Product — only shown when a category is selected */}
        {category !== ALL && productsForCategory.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 shrink-0">
              Produit
            </span>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white text-sm text-gray-700 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1D164E] min-w-[220px]"
            >
              <option value={ALL}>Tous les produits</option>
              {productsForCategory.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} — {formatEUR(p.revenue)}
                </option>
              ))}
            </select>
          </div>
        )}

        {isFiltered && (
          <button
            onClick={() => {
              setCategory(ALL)
              setProduct(ALL)
            }}
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
