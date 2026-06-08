/**
 * Wrapper minimal SerpAPI — google search FR/Paris.
 * Doc : https://serpapi.com/search-api
 */

export interface SerpOrganicResult {
  position: number
  title: string
  link: string
  snippet?: string
  displayed_link?: string
}

export interface SerpResponse {
  organic_results?: SerpOrganicResult[]
  error?: string
}

const SERPAPI_ENDPOINT = 'https://serpapi.com/search.json'

export async function serpSearch(query: string, apiKey: string): Promise<SerpResponse> {
  const url = new URL(SERPAPI_ENDPOINT)
  url.searchParams.set('q', query)
  url.searchParams.set('hl', 'fr')
  url.searchParams.set('gl', 'fr')
  url.searchParams.set('google_domain', 'google.fr')
  url.searchParams.set('location', 'Paris, France')
  url.searchParams.set('num', '10')
  url.searchParams.set('api_key', apiKey)

  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    return { error: `SerpAPI HTTP ${res.status}` }
  }
  return (await res.json()) as SerpResponse
}

/**
 * Cherche la position d'une URL/domaine cible dans les résultats SerpAPI.
 * Retourne -1 si absente du top.
 */
export function findRankingPosition(
  results: SerpOrganicResult[] | undefined,
  matcher: (url: string) => boolean
): number {
  if (!results) return -1
  const found = results.find((r) => matcher(r.link))
  return found ? found.position : -1
}
