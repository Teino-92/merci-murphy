/**
 * Client Sanity avec write token — utilisé uniquement par scripts SEO.
 * NE PAS importer côté Next (le token n'est jamais exposé).
 */

import { createClient, type SanityClient } from '@sanity/client'

export function getWriteClient(): SanityClient {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
  const token = process.env.SANITY_API_TOKEN
  if (!projectId) throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID manquant')
  if (!token) throw new Error('SANITY_API_TOKEN manquant (write token requis)')
  return createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    token,
    useCdn: false,
  })
}
