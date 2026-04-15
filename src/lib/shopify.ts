const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!
const SHOPIFY_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!
const SHOPIFY_API_URL = `https://${SHOPIFY_DOMAIN}/api/2026-01/graphql.json`

async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(SHOPIFY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Shopify API error: ${res.status} — ${text}`)
  }

  const json = await res.json()
  if (json.errors) throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`)
  return json.data as T
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ShopifyImage {
  url: string
  altText: string | null
  width: number
  height: number
}

export interface ShopifyPrice {
  amount: string
  currencyCode: string
}

export interface ShopifyProductVariant {
  id: string
  title: string
  availableForSale: boolean
  quantityAvailable: number
  price: ShopifyPrice
  compareAtPrice: ShopifyPrice | null
}

export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  availableForSale: boolean
  featuredImage: ShopifyImage | null
  images: { nodes: ShopifyImage[] }
  priceRange: { minVariantPrice: ShopifyPrice }
  variants: { nodes: ShopifyProductVariant[] }
  collections: { nodes: { handle: string; title: string }[] }
}

export interface ShopifyCollection {
  id: string
  title: string
  handle: string
  description: string
  image: ShopifyImage | null
  products: { nodes: ShopifyProduct[] }
}

// ─── Queries ─────────────────────────────────────────────────────────────────

const PRODUCT_FRAGMENT = `
  id
  title
  handle
  description
  availableForSale
  featuredImage { url altText width height }
  images(first: 3) { nodes { url altText width height } }
  priceRange { minVariantPrice { amount currencyCode } }
  collections(first: 3) { nodes { handle title } }
`

const PRODUCT_BASE_FRAGMENT = `
  id
  title
  handle
  description
  availableForSale
  featuredImage { url altText width height }
  priceRange { minVariantPrice { amount currencyCode } }
  collections(first: 3) { nodes { handle title } }
`

const PRODUCT_DETAIL_FRAGMENT = `
  ${PRODUCT_BASE_FRAGMENT}
  descriptionHtml
  images(first: 10) { nodes { url altText width height } }
  variants(first: 20) {
    nodes {
      id
      title
      availableForSale
      quantityAvailable
      price { amount currencyCode }
      compareAtPrice { amount currencyCode }
    }
  }
`

export async function getAllProducts(first = 250): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>(
    `{ products(first: ${first}, sortKey: BEST_SELLING) { nodes { ${PRODUCT_FRAGMENT} } } }`
  )
  return data.products.nodes
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ product: ShopifyProduct | null }>(
    `query ProductByHandle($handle: String!) {
      product(handle: $handle) { ${PRODUCT_DETAIL_FRAGMENT} }
    }`,
    { handle }
  )
  return data.product
}

export async function getAllCollections(): Promise<ShopifyCollection[]> {
  const data = await shopifyFetch<{ collections: { nodes: ShopifyCollection[] } }>(
    `{
      collections(first: 10) {
        nodes {
          id title handle description
          image { url altText width height }
          products(first: 0) { nodes { id } }
        }
      }
    }`
  )
  return data.collections.nodes
}

export async function getCollectionByHandle(handle: string): Promise<ShopifyCollection | null> {
  const data = await shopifyFetch<{ collection: ShopifyCollection | null }>(
    `query CollectionByHandle($handle: String!) {
      collection(handle: $handle) {
        id title handle description
        image { url altText width height }
        products(first: 24, sortKey: MANUAL) { nodes { ${PRODUCT_FRAGMENT} } }
      }
    }`,
    { handle }
  )
  return data.collection
}

export async function getFeaturedProducts(first = 6): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>(
    `{ products(first: ${first}, sortKey: BEST_SELLING) { nodes { ${PRODUCT_FRAGMENT} } } }`
  )
  return data.products.nodes
}

export async function getProductsByHandles(handles: string[]): Promise<ShopifyProduct[]> {
  const results = await Promise.all(
    handles.map((handle) =>
      shopifyFetch<{ product: ShopifyProduct | null }>(
        `query($handle: String!) { product(handle: $handle) { ${PRODUCT_FRAGMENT} } }`,
        { handle }
      ).then((d) => d.product)
    )
  )
  return results.filter((p): p is ShopifyProduct => p !== null)
}

// ─── Cart Types ───────────────────────────────────────────────────────────────

export interface CartLine {
  id: string
  quantity: number
  variantId: string
  title: string
  variantTitle: string
  price: ShopifyPrice
  image: ShopifyImage | null
  handle: string
}

export interface Cart {
  id: string
  checkoutUrl: string
  lines: CartLine[]
  totalAmount: ShopifyPrice
  totalQuantity: number
}

interface CartApiLine {
  id: string
  quantity: number
  cost: { totalAmount: ShopifyPrice }
  merchandise: {
    id: string
    title: string
    price: ShopifyPrice
    image: ShopifyImage | null
    product: { title: string; handle: string }
  }
}

interface CartApiResponse {
  id: string
  checkoutUrl: string
  cost: { totalAmount: ShopifyPrice }
  lines: { nodes: CartApiLine[] }
}

const CART_FRAGMENT = `
  id
  checkoutUrl
  cost { totalAmount { amount currencyCode } }
  lines(first: 100) {
    nodes {
      id
      quantity
      cost { totalAmount { amount currencyCode } }
      merchandise {
        ... on ProductVariant {
          id
          title
          price { amount currencyCode }
          image { url altText width height }
          product { title handle }
        }
      }
    }
  }
`

function mapCart(cart: CartApiResponse): Cart {
  const lines: CartLine[] = cart.lines.nodes.map((node) => ({
    id: node.id,
    quantity: node.quantity,
    variantId: node.merchandise.id,
    title: node.merchandise.product.title,
    variantTitle: node.merchandise.title,
    price: node.merchandise.price,
    image: node.merchandise.image,
    handle: node.merchandise.product.handle,
  }))
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    lines,
    totalAmount: cart.cost.totalAmount,
    totalQuantity: lines.reduce((sum, l) => sum + l.quantity, 0),
  }
}

export async function createCart(variantId: string, quantity = 1): Promise<Cart> {
  const data = await shopifyFetch<{ cartCreate: { cart: CartApiResponse } }>(
    `mutation CartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart { ${CART_FRAGMENT} }
      }
    }`,
    { input: { lines: [{ merchandiseId: variantId, quantity }] } }
  )
  return mapCart(data.cartCreate.cart)
}

export async function addToCart(cartId: string, variantId: string, quantity = 1): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesAdd: { cart: CartApiResponse } }>(
    `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ${CART_FRAGMENT} }
      }
    }`,
    { cartId, lines: [{ merchandiseId: variantId, quantity }] }
  )
  return mapCart(data.cartLinesAdd.cart)
}

export async function removeFromCart(cartId: string, lineId: string): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesRemove: { cart: CartApiResponse } }>(
    `mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ${CART_FRAGMENT} }
      }
    }`,
    { cartId, lineIds: [lineId] }
  )
  return mapCart(data.cartLinesRemove.cart)
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesUpdate: { cart: CartApiResponse } }>(
    `mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ${CART_FRAGMENT} }
      }
    }`,
    { cartId, lines: [{ id: lineId, quantity }] }
  )
  return mapCart(data.cartLinesUpdate.cart)
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{ cart: CartApiResponse | null }>(
    `query GetCart($cartId: ID!) {
      cart(id: $cartId) { ${CART_FRAGMENT} }
    }`,
    { cartId }
  )
  if (!data.cart) return null
  return mapCart(data.cart)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatPrice(price: ShopifyPrice): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: price.currencyCode,
  }).format(parseFloat(price.amount))
}
