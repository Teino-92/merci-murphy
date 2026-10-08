/**
 * Client Unsplash minimal (API officielle) pour les couvertures du blog auto.
 *
 * Règles Unsplash respectées :
 *  - hotlink interdit pour un usage "stocké" → on télécharge et on réimporte dans Sanity
 *  - appel de `download_location` à chaque photo réellement utilisée (tracking obligatoire)
 *  - crédit visible "Photo : Nom sur Unsplash" avec liens utm (stocké dans coverImage.credit*)
 */

import type { SanityClient } from '@sanity/client'

const UNSPLASH_API = 'https://api.unsplash.com'
const UTM = 'utm_source=merci_murphy&utm_medium=referral'

export interface UnsplashCandidate {
  id: string
  description: string
  previewUrl: string
  rawUrl: string
  pageUrl: string
  downloadLocation: string
  authorName: string
  authorUrl: string
}

interface UnsplashPhoto {
  id: string
  description: string | null
  alt_description: string | null
  urls: { raw: string; regular: string; small: string }
  links: { html: string; download_location: string }
  user: { name: string; links: { html: string } }
}

function getAccessKey(): string {
  const k = process.env.UNSPLASH_ACCESS_KEY
  if (!k) throw new Error('UNSPLASH_ACCESS_KEY manquant')
  return k
}

function withUtm(url: string): string {
  return `${url}${url.includes('?') ? '&' : '?'}${UTM}`
}

export async function searchUnsplash(query: string, perPage = 20): Promise<UnsplashCandidate[]> {
  const params = new URLSearchParams({
    query,
    per_page: String(perPage),
    orientation: 'landscape',
    content_filter: 'high',
  })
  const res = await fetch(`${UNSPLASH_API}/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${getAccessKey()}`, 'Accept-Version': 'v1' },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Unsplash search ${res.status}: ${await res.text()}`)
  const data = (await res.json()) as { results: UnsplashPhoto[] }

  return data.results.map((p) => ({
    id: p.id,
    description: [p.alt_description, p.description].filter(Boolean).join(' · '),
    previewUrl: p.urls.regular,
    rawUrl: p.urls.raw,
    pageUrl: withUtm(p.links.html),
    downloadLocation: p.links.download_location,
    authorName: p.user.name,
    authorUrl: withUtm(p.user.links.html),
  }))
}

/** Tracking obligatoire Unsplash quand une photo est effectivement utilisée. */
export async function trackUnsplashDownload(c: UnsplashCandidate): Promise<void> {
  await fetch(c.downloadLocation, {
    headers: { Authorization: `Client-ID ${getAccessKey()}` },
    cache: 'no-store',
  })
}

/** Télécharge la photo (2000px) et l'importe comme asset Sanity. Renvoie l'_id de l'asset. */
export async function uploadUnsplashToSanity(
  client: SanityClient,
  c: UnsplashCandidate,
  filename: string
): Promise<string> {
  const sep = c.rawUrl.includes('?') ? '&' : '?'
  const res = await fetch(`${c.rawUrl}${sep}w=2000&q=85&fm=jpg&fit=max`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Unsplash download ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())

  const asset = await client.assets.upload('image', buffer, {
    filename: `${filename}.jpg`,
    contentType: 'image/jpeg',
    source: { id: c.id, name: 'unsplash', url: c.pageUrl },
    creditLine: `${c.authorName} / Unsplash`,
  })
  return asset._id
}
