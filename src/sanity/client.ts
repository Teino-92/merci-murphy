import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

// Token serveur — lecture authentifiée pour types restreints par ACL (ex: seoPage).
// Sans token, Sanity omet ces docs ("reason: permission"). useCdn désactivé quand token présent.
const SANITY_READ_TOKEN = process.env.SANITY_API_READ_TOKEN ?? process.env.SANITY_API_TOKEN

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: !SANITY_READ_TOKEN,
  token: SANITY_READ_TOKEN,
})

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
