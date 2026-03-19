import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getTransactions, getTransactionDetail, getPayouts } from '@/lib/sumup'
import type { SumUpTransaction, SumUpProduct } from '@/lib/sumup'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ByDay {
  date: string
  revenue: number
  count: number
}

interface ByProduct {
  name: string
  category: string
  revenue: number
  quantity: number
}

interface ByPaymentType {
  type: string
  count: number
  revenue: number
}

// ─── Product → Category mapping ───────────────────────────────────────────────
// Maps real SumUp product names to their catalog category.
// Based on the SumUp catalog structure observed in the back-office.

function productToCategory(productName: string): string {
  const n = productName.trim().toLowerCase()

  // SPA MAISON POILUS
  if (
    n.includes('bain') ||
    n.includes('épilation') ||
    n.includes('epilation') ||
    n.includes('brossage') ||
    n.includes('coupe griffes') ||
    n.includes('soins spécifiques') ||
    n.includes('soins specifiques') ||
    n.includes('atelier comme à la maison') ||
    n.includes('atelier comme a la maison')
  )
    return 'Spa maison POILUS'

  // BICHONNER (toilettage)
  if (n.includes('toilettage') || n.includes('coupe') || n.includes('bichon')) return 'Bichonner'

  // MASSAGE
  if (n.includes('massage') || n.includes('pack 3 massages')) return 'Massage'

  // SOIGNER
  if (
    n.includes('ostéopathe') ||
    n.includes('osteopathe') ||
    n.includes('ostéo') ||
    n.includes('osteo')
  )
    return 'Soigner'

  // CRÈCHE & EDUCATION
  if (
    n.includes('crèche') ||
    n.includes('creche') ||
    n.includes('éducation') ||
    n.includes('education') ||
    n.includes('cours')
  )
    return 'Crèche & Éducation'

  // CHILLER (balnéo)
  if (n.includes('balnéo') || n.includes('balneo') || n.includes('spa')) return 'Chiller'

  // Acomptes
  if (n.includes('acompte')) return 'Acomptes'

  return 'Autre'
}

// ─── product_summary normalizer ───────────────────────────────────────────────
// Used only when no products[] detail is available (fallback).

function normalizeServiceName(summary: string): string {
  const s = summary.trim().toLowerCase()

  if (s.includes('maison poilus')) return 'Spa maison POILUS'
  if (s.includes('acompte toilettage')) return 'Acomptes'
  if (s.includes('acompte bains')) return 'Acomptes'
  if (s.includes('acompte creche') || s.includes('acompte crèche')) return 'Acomptes'
  if (s.includes('acompte education') || s.includes('acompte éducation')) return 'Acomptes'
  if (s.includes('acompte massage')) return 'Acomptes'
  if (s.includes('acompte balnéo') || s.includes('acompte balneo')) return 'Acomptes'
  if (s.includes('acompte')) return 'Acomptes'
  if (s.includes('bains')) return 'Spa maison POILUS'
  if (s.includes('creche') || s.includes('crèche')) return 'Crèche & Éducation'
  if (s.includes('education') || s.includes('éducation')) return 'Crèche & Éducation'
  if (s.includes('osteo') || s.includes('ostéo')) return 'Soigner'
  if (s.includes('massage')) return 'Massage'
  if (s.includes('toilettage')) return 'Bichonner'

  return 'Autre'
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function batchFetchDetails(
  transactions: SumUpTransaction[],
  concurrency = 10
): Promise<Map<string, SumUpProduct[]>> {
  const result = new Map<string, SumUpProduct[]>()
  const chunks: SumUpTransaction[][] = []

  for (let i = 0; i < transactions.length; i += concurrency) {
    chunks.push(transactions.slice(i, i + concurrency))
  }

  for (const chunk of chunks) {
    const results = await Promise.allSettled(chunk.map((tx) => getTransactionDetail(tx.id)))
    results.forEach((r, idx) => {
      const tx = chunk[idx]
      if (r.status === 'fulfilled' && r.value?.products) {
        result.set(tx.id, r.value.products)
      } else {
        result.set(tx.id, [])
      }
    })
  }

  return result
}

function aggregateData(
  transactions: SumUpTransaction[],
  productsMap: Map<string, SumUpProduct[]>
): {
  byDay: ByDay[]
  byProduct: ByProduct[]
  byPaymentType: ByPaymentType[]
  totalRevenue: number
  transactionCount: number
  avgTicket: number
  refundRate: number
} {
  const dayMap = new Map<string, { revenue: number; count: number }>()
  // key = "category::productName"
  const productMap = new Map<
    string,
    { category: string; name: string; revenue: number; quantity: number }
  >()
  const paymentMap = new Map<string, { count: number; revenue: number }>()

  let totalRevenue = 0
  let refundedRevenue = 0
  let transactionCount = 0

  for (const tx of transactions) {
    const amount = tx.amount ?? 0
    const refunded = tx.refunded_amount ?? 0
    const isSuccessful = tx.status === 'SUCCESSFUL' || tx.status === 'ACCEPTED'
    const isRefunded = tx.status === 'REFUNDED'

    if (!isSuccessful && !isRefunded) continue

    // Detect acomptes — deposits for future appointments, not counted as revenue
    const products = productsMap.get(tx.id) ?? []
    const isAcompte =
      products.length > 0
        ? products.every((p) => productToCategory(p.name) === 'Acomptes')
        : tx.product_summary
          ? normalizeServiceName(tx.product_summary) === 'Acomptes'
          : false

    transactionCount++

    if (isSuccessful && !isAcompte) {
      totalRevenue += amount
    }
    if (isRefunded || refunded > 0) {
      refundedRevenue += refunded > 0 ? refunded : amount
    }

    // By day — exclude acomptes
    const day = tx.timestamp.slice(0, 10)
    const dayEntry = dayMap.get(day) ?? { revenue: 0, count: 0 }
    dayEntry.revenue += isSuccessful && !isAcompte ? amount : 0
    dayEntry.count += 1
    dayMap.set(day, dayEntry)

    // By payment type — exclude acomptes
    const payType = tx.payment_type ?? 'UNKNOWN'
    const payEntry = paymentMap.get(payType) ?? { count: 0, revenue: 0 }
    payEntry.count += 1
    payEntry.revenue += isSuccessful && !isAcompte ? amount : 0
    paymentMap.set(payType, payEntry)

    // By product — always record for reference
    if (products.length > 0) {
      for (const p of products) {
        const category = productToCategory(p.name)
        const key = `${category}::${p.name}`
        const entry = productMap.get(key) ?? { category, name: p.name, revenue: 0, quantity: 0 }
        entry.revenue += p.total_price ?? p.price * p.quantity
        entry.quantity += p.quantity
        productMap.set(key, entry)
      }
    } else if (tx.product_summary) {
      const category = normalizeServiceName(tx.product_summary)
      const name = tx.product_summary.trim()
      const key = `${category}::${name}`
      const entry = productMap.get(key) ?? { category, name, revenue: 0, quantity: 0 }
      entry.revenue += isSuccessful ? amount : 0
      entry.quantity += 1
      productMap.set(key, entry)
    }
  }

  const byDay: ByDay[] = Array.from(dayMap.entries())
    .map(([date, v]) => ({ date, revenue: v.revenue, count: v.count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const byProduct: ByProduct[] = Array.from(productMap.values()).sort(
    (a, b) => b.revenue - a.revenue
  )

  const byPaymentType: ByPaymentType[] = Array.from(paymentMap.entries()).map(([type, v]) => ({
    type,
    count: v.count,
    revenue: v.revenue,
  }))

  const avgTicket = transactionCount > 0 ? totalRevenue / transactionCount : 0
  const refundRate = totalRevenue > 0 ? refundedRevenue / totalRevenue : 0

  return {
    byDay,
    byProduct,
    byPaymentType,
    totalRevenue,
    transactionCount,
    avgTicket,
    refundRate,
  }
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')

  // Validate date params
  const dateRe = /^\d{4}-\d{2}-\d{2}$/
  if (!fromParam || !toParam || !dateRe.test(fromParam) || !dateRe.test(toParam)) {
    return NextResponse.json(
      { error: 'Invalid params. Use ?from=YYYY-MM-DD&to=YYYY-MM-DD' },
      { status: 400 }
    )
  }
  if (fromParam > toParam) {
    return NextResponse.json({ error: 'from must be <= to' }, { status: 400 })
  }

  // Cache key
  const period = `${fromParam}_${toParam}`

  try {
    const from = new Date(`${fromParam}T00:00:00Z`)
    const to = new Date(`${toParam}T23:59:59Z`)

    // Fetch all transactions for the period
    const rawTransactions = await getTransactions(from, to)

    // Deduplicate by transaction ID — cash transactions sometimes appear twice
    // (once as ACCEPTED, once as SUCCESSFUL). Keep SUCCESSFUL over ACCEPTED.
    const txMap = new Map<string, (typeof rawTransactions)[0]>()
    for (const tx of rawTransactions) {
      const existing = txMap.get(tx.id)
      if (!existing || tx.status === 'SUCCESSFUL') {
        txMap.set(tx.id, tx)
      }
    }
    const transactions = Array.from(txMap.values())

    // Batch fetch transaction details (for products array)
    const productsMap = await batchFetchDetails(transactions, 10)

    // Aggregate
    const {
      byDay,
      byProduct,
      byPaymentType,
      totalRevenue,
      transactionCount,
      avgTicket,
      refundRate,
    } = aggregateData(transactions, productsMap)

    // Fetch payouts
    const payouts = await getPayouts(10)

    // Upsert into sumup_cache
    const { error } = await supabaseAdmin.from('sumup_cache').upsert(
      {
        period,
        transactions: transactions,
        by_day: byDay,
        by_product: byProduct,
        by_payment_type: byPaymentType,
        payouts: payouts,
        total_revenue: totalRevenue,
        transaction_count: transactionCount,
        avg_ticket: avgTicket,
        refund_rate: refundRate,
        refreshed_at: new Date().toISOString(),
      },
      { onConflict: 'period' }
    )

    if (error) throw error

    return NextResponse.json({
      ok: true,
      period,
      transactionCount,
      totalRevenue,
      refreshedAt: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
