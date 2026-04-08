// src/lib/shopify-server.ts
// Server-side Shopify fetch for use in API routes (no Next.js cache)

interface ShopifyProductBasic {
  id: string
  title: string
  handle: string
  featuredImage: { url: string; altText: string | null } | null
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } }
}

export async function getBestsellingProducts(count = 3): Promise<ShopifyProductBasic[]> {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN

  const query = `{
    products(first: ${count}, sortKey: BEST_SELLING) {
      nodes {
        id
        title
        handle
        featuredImage { url altText }
        priceRange { minVariantPrice { amount currencyCode } }
      }
    }
  }`

  const res = await fetch(`https://${domain}/api/2026-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token!,
    },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) return []
  const json = await res.json()
  return json.data?.products?.nodes ?? []
}
