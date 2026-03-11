const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!
const ADMIN_API_URL = `https://${SHOPIFY_DOMAIN}/admin/api/2026-01/graphql.json`

async function adminFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(ADMIN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Shopify Admin API error: ${res.status}`)
  const json = await res.json()
  if (json.errors) throw new Error(`Shopify Admin GraphQL: ${JSON.stringify(json.errors)}`)
  return json.data as T
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RevenueStats {
  totalRevenue: number
  ordersCount: number
  avgOrderValue: number
  currency: string
}

export interface DailyRevenue {
  date: string
  revenue: number
  orders: number
}

export interface TopProduct {
  title: string
  quantity: number
  revenue: number
}

type OrderNode = {
  createdAt: string
  totalPriceSet: { shopMoney: { amount: string; currencyCode: string } }
  lineItems: {
    edges: {
      node: {
        title: string
        quantity: number
        originalTotalSet: { shopMoney: { amount: string } }
      }
    }[]
  }
}

type OrdersData = { orders: { edges: { node: OrderNode }[] } }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toISO(dateStr: string, endOfDay = false) {
  return endOfDay ? `${dateStr}T23:59:59Z` : `${dateStr}T00:00:00Z`
}

function defaultRange(days = 30) {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - days)
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) }
}

async function fetchOrders(from?: string, to?: string): Promise<OrderNode[]> {
  if (!SHOPIFY_ADMIN_TOKEN) return []

  const range = from && to ? { from, to } : defaultRange(30)

  const gql = `
    query Orders($query: String!) {
      orders(first: 250, query: $query) {
        edges {
          node {
            createdAt
            totalPriceSet { shopMoney { amount currencyCode } }
            lineItems(first: 20) {
              edges {
                node {
                  title
                  quantity
                  originalTotalSet { shopMoney { amount } }
                }
              }
            }
          }
        }
      }
    }
  `

  try {
    const data = await adminFetch<OrdersData>(gql, {
      query: `created_at:>='${toISO(range.from)}' created_at:<='${toISO(range.to, true)}' financial_status:paid`,
    })
    return data.orders.edges.map((e) => e.node)
  } catch {
    return []
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getRevenueStats(): Promise<RevenueStats> {
  const orders = await fetchOrders()
  const currency = orders[0]?.totalPriceSet.shopMoney.currencyCode ?? 'EUR'
  const totalRevenue = orders.reduce(
    (sum, o) => sum + parseFloat(o.totalPriceSet.shopMoney.amount),
    0
  )
  return {
    totalRevenue,
    ordersCount: orders.length,
    avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
    currency,
  }
}

export async function getDailyRevenue(from?: string, to?: string): Promise<DailyRevenue[]> {
  const range = from && to ? { from, to } : defaultRange(90)
  const orders = await fetchOrders(range.from, range.to)

  // Build date map
  const map: Record<string, { revenue: number; orders: number }> = {}
  const start = new Date(range.from)
  const end = new Date(range.to)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    map[d.toISOString().slice(0, 10)] = { revenue: 0, orders: 0 }
  }

  for (const order of orders) {
    const key = order.createdAt.slice(0, 10)
    if (map[key]) {
      map[key].revenue += parseFloat(order.totalPriceSet.shopMoney.amount)
      map[key].orders += 1
    }
  }

  return Object.entries(map).map(([date, v]) => ({ date, ...v }))
}

export async function getTopProducts(from?: string, to?: string): Promise<TopProduct[]> {
  const orders = await fetchOrders(from, to)

  const map: Record<string, { quantity: number; revenue: number }> = {}

  for (const order of orders) {
    for (const { node: item } of order.lineItems.edges) {
      if (!map[item.title]) map[item.title] = { quantity: 0, revenue: 0 }
      map[item.title].quantity += item.quantity
      map[item.title].revenue += parseFloat(item.originalTotalSet.shopMoney.amount)
    }
  }

  return Object.entries(map)
    .map(([title, v]) => ({ title, ...v }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
}

export interface ShopifyCustomer {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  phone: string | null
  ordersCount: number
  totalSpent: string
  createdAt: string
  note: string | null
}

export interface ShopifyCustomerOrder {
  id: string
  name: string
  createdAt: string
  totalPrice: string
  financialStatus: string
  lineItems: { title: string; quantity: number }[]
}

type ShopifyCustomerNode = {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  phone: string | null
  numberOfOrders: string
  amountSpent: { amount: string; currencyCode: string }
  createdAt: string
  note: string | null
}

export async function getShopifyCustomers(limit = 50): Promise<ShopifyCustomer[]> {
  if (!SHOPIFY_ADMIN_TOKEN) return []
  try {
    const data = await adminFetch<{ customers: { edges: { node: ShopifyCustomerNode }[] } }>(`
      query {
        customers(first: ${limit}, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id firstName lastName email phone
              numberOfOrders
              amountSpent { amount currencyCode }
              createdAt note
            }
          }
        }
      }
    `)
    return data.customers.edges.map(({ node }) => ({
      id: node.id,
      firstName: node.firstName,
      lastName: node.lastName,
      email: node.email,
      phone: node.phone,
      ordersCount: parseInt(node.numberOfOrders),
      totalSpent: node.amountSpent.amount,
      createdAt: node.createdAt,
      note: node.note,
    }))
  } catch {
    return []
  }
}

export async function getShopifyCustomerById(
  id: string
): Promise<{ customer: ShopifyCustomer; orders: ShopifyCustomerOrder[] } | null> {
  if (!SHOPIFY_ADMIN_TOKEN) return null
  try {
    const gid = id.startsWith('gid://') ? id : `gid://shopify/Customer/${id}`
    const data = await adminFetch<{
      customer: ShopifyCustomerNode & {
        orders: {
          edges: {
            node: {
              id: string
              name: string
              createdAt: string
              totalPriceSet: { shopMoney: { amount: string } }
              displayFinancialStatus: string
              lineItems: { edges: { node: { title: string; quantity: number } }[] }
            }
          }[]
        }
      }
    }>(
      `
      query($id: ID!) {
        customer(id: $id) {
          id firstName lastName email phone
          numberOfOrders
          amountSpent { amount currencyCode }
          createdAt note
          orders(first: 20, sortKey: CREATED_AT, reverse: true) {
            edges {
              node {
                id name createdAt
                totalPriceSet { shopMoney { amount } }
                displayFinancialStatus
                lineItems(first: 5) {
                  edges { node { title quantity } }
                }
              }
            }
          }
        }
      }
    `,
      { id: gid }
    )
    if (!data.customer) return null
    const c = data.customer
    return {
      customer: {
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        ordersCount: parseInt(c.numberOfOrders),
        totalSpent: c.amountSpent.amount,
        createdAt: c.createdAt,
        note: c.note,
      },
      orders: c.orders.edges.map(({ node }) => ({
        id: node.id,
        name: node.name,
        createdAt: node.createdAt,
        totalPrice: node.totalPriceSet.shopMoney.amount,
        financialStatus: node.displayFinancialStatus,
        lineItems: node.lineItems.edges.map(({ node: li }) => ({
          title: li.title,
          quantity: li.quantity,
        })),
      })),
    }
  } catch {
    return null
  }
}
