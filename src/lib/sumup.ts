// SumUp API client — server-side only, never expose credentials to browser

const SUMUP_API_BASE = 'https://api.sumup.com'
const SUMUP_API_KEY = process.env.SUMUP_API_KEY!
const SUMUP_MERCHANT_CODE_ENV = process.env.SUMUP_MERCHANT_CODE

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SumUpTransaction {
  id: string
  transaction_code: string
  amount: number
  currency: string
  timestamp: string
  status: string
  payment_type: string
  product_summary: string | null
  refunded_amount?: number
}

export interface SumUpTransactionDetail extends SumUpTransaction {
  products: SumUpProduct[]
}

export interface SumUpProduct {
  name: string
  price: number
  quantity: number
  total_price: number
}

export interface SumUpPayout {
  id: string
  date: string
  amount: number
  fee: number
  net: number
  status: string
  currency: string
}

interface SumUpMeResponse {
  merchant_profile: {
    merchant_code: string
  }
}

interface SumUpTransactionHistoryResponse {
  items: SumUpTransaction[]
}

// ─── Auth helper ─────────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${SUMUP_API_KEY}`,
    'Content-Type': 'application/json',
  }
}

async function sumupFetch<T>(path: string): Promise<T> {
  const url = `${SUMUP_API_BASE}${path}`
  const res = await fetch(url, {
    headers: authHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`SumUp API error ${res.status} on ${path}: ${text}`)
  }
  return res.json() as Promise<T>
}

// ─── getMerchantCode ─────────────────────────────────────────────────────────

let _merchantCodeCache: string | null = null

export async function getMerchantCode(): Promise<string> {
  if (_merchantCodeCache) return _merchantCodeCache
  if (SUMUP_MERCHANT_CODE_ENV) {
    _merchantCodeCache = SUMUP_MERCHANT_CODE_ENV
    return _merchantCodeCache
  }
  const data = await sumupFetch<SumUpMeResponse>('/v0.1/me')
  _merchantCodeCache = data.merchant_profile.merchant_code
  return _merchantCodeCache
}

// ─── getTransactions ─────────────────────────────────────────────────────────

export async function getTransactions(from: Date, to: Date): Promise<SumUpTransaction[]> {
  if (!SUMUP_API_KEY) return []
  try {
    const merchantCode = await getMerchantCode()
    const fromStr = from.toISOString()
    const toStr = to.toISOString()
    const params = new URLSearchParams({
      oldest_time: fromStr,
      newest_time: toStr,
      statuses: 'SUCCESSFUL,REFUNDED',
      limit: '1000',
    })
    const data = await sumupFetch<SumUpTransactionHistoryResponse>(
      `/v2.1/merchants/${merchantCode}/transactions/history?${params.toString()}`
    )
    return data.items ?? []
  } catch {
    return []
  }
}

// ─── getTransactionDetail ────────────────────────────────────────────────────

export async function getTransactionDetail(id: string): Promise<SumUpTransactionDetail | null> {
  if (!SUMUP_API_KEY) return null
  try {
    const data = await sumupFetch<SumUpTransactionDetail>(
      `/v0.1/me/transactions?id=${encodeURIComponent(id)}`
    )
    return data
  } catch {
    return null
  }
}

// ─── getPayouts ───────────────────────────────────────────────────────────────

interface SumUpPayoutRaw {
  id: string
  date: string
  amount: number
  fee: number
  status: string
  currency: string
}

interface SumUpPayoutsResponse {
  items: SumUpPayoutRaw[]
}

export async function getPayouts(limit = 10): Promise<SumUpPayout[]> {
  if (!SUMUP_API_KEY) return []
  try {
    const params = new URLSearchParams({ limit: String(limit) })
    const data = await sumupFetch<SumUpPayoutsResponse>(`/v0.1/me/payouts?${params.toString()}`)
    return (data.items ?? []).map((p) => ({
      id: p.id,
      date: p.date,
      amount: p.amount,
      fee: p.fee,
      net: p.amount - p.fee,
      status: p.status,
      currency: p.currency ?? 'EUR',
    }))
  } catch {
    return []
  }
}
