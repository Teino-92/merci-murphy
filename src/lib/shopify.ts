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

// ─── Cart Types (Checkout-based) ─────────────────────────────────────────────

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

interface CheckoutResponse {
  id: string
  webUrl: string
  subtotalPriceV2: ShopifyPrice
  lineItems: {
    edges: Array<{
      node: {
        id: string
        quantity: number
        title: string
        variant: {
          id: string
          title: string
          priceV2: ShopifyPrice
          image: ShopifyImage | null
          product: { handle: string }
        }
      }
    }>
  }
}

const CHECKOUT_FRAGMENT = `
  id
  webUrl
  subtotalPriceV2 { amount currencyCode }
  lineItems(first: 100) {
    edges {
      node {
        id
        quantity
        title
        variant {
          id
          title
          priceV2 { amount currencyCode }
          image { url altText width height }
          product { handle }
        }
      }
    }
  }
`

function mapCheckout(checkout: CheckoutResponse): Cart {
  const lines: CartLine[] = checkout.lineItems.edges.map(({ node }) => ({
    id: node.id,
    quantity: node.quantity,
    variantId: node.variant.id,
    title: node.title,
    variantTitle: node.variant.title,
    price: node.variant.priceV2,
    image: node.variant.image,
    handle: node.variant.product.handle,
  }))
  return {
    id: checkout.id,
    checkoutUrl: checkout.webUrl,
    lines,
    totalAmount: checkout.subtotalPriceV2,
    totalQuantity: lines.reduce((sum, l) => sum + l.quantity, 0),
  }
}

export async function createCart(variantId: string, quantity = 1): Promise<Cart> {
  const data = await shopifyFetch<{ checkoutCreate: { checkout: CheckoutResponse } }>(
    `mutation CheckoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout { ${CHECKOUT_FRAGMENT} }
      }
    }`,
    { input: { lineItems: [{ variantId, quantity }] } }
  )
  return mapCheckout(data.checkoutCreate.checkout)
}

export async function addToCart(cartId: string, variantId: string, quantity = 1): Promise<Cart> {
  const data = await shopifyFetch<{ checkoutLineItemsAdd: { checkout: CheckoutResponse } }>(
    `mutation CheckoutLineItemsAdd($checkoutId: ID!, $lineItems: [CheckoutLineItemInput!]!) {
      checkoutLineItemsAdd(checkoutId: $checkoutId, lineItems: $lineItems) {
        checkout { ${CHECKOUT_FRAGMENT} }
      }
    }`,
    { checkoutId: cartId, lineItems: [{ variantId, quantity }] }
  )
  return mapCheckout(data.checkoutLineItemsAdd.checkout)
}

export async function removeFromCart(cartId: string, lineId: string): Promise<Cart> {
  const data = await shopifyFetch<{ checkoutLineItemsRemove: { checkout: CheckoutResponse } }>(
    `mutation CheckoutLineItemsRemove($checkoutId: ID!, $lineItemIds: [ID!]!) {
      checkoutLineItemsRemove(checkoutId: $checkoutId, lineItemIds: $lineItemIds) {
        checkout { ${CHECKOUT_FRAGMENT} }
      }
    }`,
    { checkoutId: cartId, lineItemIds: [lineId] }
  )
  return mapCheckout(data.checkoutLineItemsRemove.checkout)
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<Cart> {
  const data = await shopifyFetch<{ checkoutLineItemsUpdate: { checkout: CheckoutResponse } }>(
    `mutation CheckoutLineItemsUpdate($checkoutId: ID!, $lineItems: [CheckoutLineItemUpdateInput!]!) {
      checkoutLineItemsUpdate(checkoutId: $checkoutId, lineItems: $lineItems) {
        checkout { ${CHECKOUT_FRAGMENT} }
      }
    }`,
    { checkoutId: cartId, lineItems: [{ id: lineId, quantity }] }
  )
  return mapCheckout(data.checkoutLineItemsUpdate.checkout)
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{ node: CheckoutResponse | null }>(
    `query GetCheckout($cartId: ID!) {
      node(id: $cartId) {
        ... on Checkout { ${CHECKOUT_FRAGMENT} }
      }
    }`,
    { cartId }
  )
  if (!data.node) return null
  return mapCheckout(data.node)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatPrice(price: ShopifyPrice): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: price.currencyCode,
  }).format(parseFloat(price.amount))
}
