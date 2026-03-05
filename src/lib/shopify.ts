const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!
const SHOPIFY_API_URL = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`

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

  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`)

  const { data } = await res.json()
  return data as T
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
  featuredImage { url altText width height }
  priceRange { minVariantPrice { amount currencyCode } }
  collections(first: 3) { nodes { handle title } }
`

const PRODUCT_DETAIL_FRAGMENT = `
  ${PRODUCT_FRAGMENT}
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
          products(first: 250, sortKey: BEST_SELLING) { nodes { ${PRODUCT_FRAGMENT} } }
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
        products(first: 24, sortKey: BEST_SELLING) { nodes { ${PRODUCT_FRAGMENT} } }
      }
    }`,
    { handle }
  )
  return data.collection
}

export async function getFeaturedProducts(first = 3): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>(
    `{ products(first: ${first}, sortKey: BEST_SELLING) { nodes { ${PRODUCT_FRAGMENT} } } }`
  )
  return data.products.nodes
}

// ─── Cart Types ──────────────────────────────────────────────────────────────

export interface CartLine {
  id: string
  quantity: number
  merchandise: {
    id: string
    title: string
    product: {
      title: string
      handle: string
      featuredImage: ShopifyImage | null
    }
    price: ShopifyPrice
  }
}

export interface Cart {
  id: string
  checkoutUrl: string
  lines: { nodes: CartLine[] }
  cost: {
    totalAmount: ShopifyPrice
    subtotalAmount: ShopifyPrice
  }
  totalQuantity: number
}

const CART_FRAGMENT = `
  id
  checkoutUrl
  totalQuantity
  lines(first: 100) {
    nodes {
      id
      quantity
      merchandise {
        ... on ProductVariant {
          id
          title
          price { amount currencyCode }
          product {
            title
            handle
            featuredImage { url altText width height }
          }
        }
      }
    }
  }
  cost {
    totalAmount { amount currencyCode }
    subtotalAmount { amount currencyCode }
  }
`

export async function createCart(variantId: string, quantity = 1): Promise<Cart> {
  const data = await shopifyFetch<{ cartCreate: { cart: Cart } }>(
    `mutation CartCreate($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart { ${CART_FRAGMENT} }
      }
    }`,
    { lines: [{ merchandiseId: variantId, quantity }] }
  )
  return data.cartCreate.cart
}

export async function addToCart(cartId: string, variantId: string, quantity = 1): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesAdd: { cart: Cart } }>(
    `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ${CART_FRAGMENT} }
      }
    }`,
    { cartId, lines: [{ merchandiseId: variantId, quantity }] }
  )
  return data.cartLinesAdd.cart
}

export async function removeFromCart(cartId: string, lineId: string): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesRemove: { cart: Cart } }>(
    `mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ${CART_FRAGMENT} }
      }
    }`,
    { cartId, lineIds: [lineId] }
  )
  return data.cartLinesRemove.cart
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesUpdate: { cart: Cart } }>(
    `mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ${CART_FRAGMENT} }
      }
    }`,
    { cartId, lines: [{ id: lineId, quantity }] }
  )
  return data.cartLinesUpdate.cart
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{ cart: Cart | null }>(
    `query GetCart($cartId: ID!) {
      cart(id: $cartId) { ${CART_FRAGMENT} }
    }`,
    { cartId }
  )
  return data.cart
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatPrice(price: ShopifyPrice): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: price.currencyCode,
  }).format(parseFloat(price.amount))
}
