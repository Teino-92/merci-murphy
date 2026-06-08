/**
 * Phase 6 — Bootstrap state Sanity (one-shot)
 *
 * Crée le doc singleton seoState à partir de :
 *  - keywords.json (queue triée par priorité)
 *  - liste des races déjà publiées (lue depuis state.json local OU depuis Sanity)
 *
 * Usage : npm run seo:bootstrap
 *
 * À lancer une seule fois pour migrer du flow local (data/state.json) vers Sanity (seoState).
 * Après ça, les cron Vercel prennent le relais via runSeoPipeline().
 */

import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { getWriteClient } from './lib/sanity-write'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: join(__dirname, '..', '..', '.env.local') })

const DATA_DIR = join(__dirname, 'data')
const KEYWORDS_FILE = join(DATA_DIR, 'keywords.json')
const STATE_FILE = join(DATA_DIR, 'state.json')
const STATE_ID = 'seoState.singleton'

interface KeywordRow {
  slug_race: string
  priorite: number
  volume_estime: string
}

async function main() {
  if (!existsSync(KEYWORDS_FILE)) {
    console.error("[seo:bootstrap] keywords.json absent — lance seo:keywords d'abord")
    process.exit(1)
  }

  const client = getWriteClient()
  const keywords = JSON.parse(readFileSync(KEYWORDS_FILE, 'utf8')) as KeywordRow[]
  const allSlugs = keywords.map((k) => k.slug_race)

  // Lit publishedRaces depuis state local si dispo, sinon depuis Sanity (docs seoPage existants)
  let publishedFromLocal: string[] = []
  if (existsSync(STATE_FILE)) {
    try {
      const local = JSON.parse(readFileSync(STATE_FILE, 'utf8'))
      publishedFromLocal = local.publishedRaces ?? []
    } catch {}
  }

  const publishedFromSanity = await client.fetch<string[]>(
    `*[_type == "seoPage" && status == "published"].slugRace`
  )
  const published = Array.from(new Set([...publishedFromLocal, ...publishedFromSanity]))
  const publishedSet = new Set(published)

  const queue = allSlugs.filter((s) => !publishedSet.has(s))
  const now = new Date().toISOString()

  await client.createOrReplace({
    _id: STATE_ID,
    _type: 'seoState',
    queue,
    publishedRaces: published,
    lastPublishedAt: null,
    lastRunAt: now,
    lastRunStatus: `[bootstrap ${now}] queue=${queue.length} published=${published.length}`,
  })

  console.log(`[seo:bootstrap] state créé`)
  console.log(`  queue: ${queue.length} races`)
  console.log(`  publishedRaces: ${published.length} (${published.join(', ')})`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
