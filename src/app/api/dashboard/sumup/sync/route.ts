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
  revenue: number
  quantity: number
}

interface ByPaymentType {
  type: string
  count: number
  revenue: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function periodToDateRange(period: string): { from: Date; to: Date } {
  const [yearStr, monthStr] = period.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10) - 1 // 0-indexed
  const from = new Date(Date.UTC(year, month, 1, 0, 0, 0))
  const to = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59))
  return { from, to }
}

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
  const productMap = new Map<string, { revenue: number; quantity: number }>()
  const paymentMap = new Map<string, { count: number; revenue: number }>()

  let totalRevenue = 0
  let refundedRevenue = 0
  let transactionCount = 0

  for (const tx of transactions) {
    const amount = tx.amount ?? 0
    const refunded = tx.refunded_amount ?? 0
    const isSuccessful = tx.status === 'SUCCESSFUL'
    const isRefunded = tx.status === 'REFUNDED'

    if (!isSuccessful && !isRefunded) continue

    transactionCount++

    if (isSuccessful) {
      totalRevenue += amount
    }
    if (isRefunded || refunded > 0) {
      refundedRevenue += refunded > 0 ? refunded : amount
    }

    // By day
    const day = tx.timestamp.slice(0, 10)
    const dayEntry = dayMap.get(day) ?? { revenue: 0, count: 0 }
    dayEntry.revenue += isSuccessful ? amount : 0
    dayEntry.count += 1
    dayMap.set(day, dayEntry)

    // By payment type
    const payType = tx.payment_type ?? 'UNKNOWN'
    const payEntry = paymentMap.get(payType) ?? { count: 0, revenue: 0 }
    payEntry.count += 1
    payEntry.revenue += isSuccessful ? amount : 0
    paymentMap.set(payType, payEntry)

    // By product
    const products = productsMap.get(tx.id) ?? []
    if (products.length > 0) {
      for (const p of products) {
        const productEntry = productMap.get(p.name) ?? { revenue: 0, quantity: 0 }
        productEntry.revenue += p.total_price ?? p.price * p.quantity
        productEntry.quantity += p.quantity
        productMap.set(p.name, productEntry)
      }
    } else if (tx.product_summary) {
      const productEntry = productMap.get(tx.product_summary) ?? { revenue: 0, quantity: 0 }
      productEntry.revenue += isSuccessful ? amount : 0
      productEntry.quantity += 1
      productMap.set(tx.product_summary, productEntry)
    }
  }

  const byDay: ByDay[] = Array.from(dayMap.entries())
    .map(([date, v]) => ({ date, revenue: v.revenue, count: v.count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const byProduct: ByProduct[] = Array.from(productMap.entries())
    .map(([name, v]) => ({ name, revenue: v.revenue, quantity: v.quantity }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

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
  const period = searchParams.get('period') ?? new Date().toISOString().slice(0, 7)

  // Validate period format YYYY-MM
  if (!/^\d{4}-\d{2}$/.test(period)) {
    return NextResponse.json({ error: 'Invalid period format. Use YYYY-MM' }, { status: 400 })
  }

  try {
    const { from, to } = periodToDateRange(period)

    // Fetch all transactions for the period
    const transactions = await getTransactions(from, to)

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
