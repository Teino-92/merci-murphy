/**
 * Phase 4 — Publish Scheduler
 *
 * - Sélectionne les N prochaines races à publier (priorité ↑) qui :
 *   1. ont du contenu généré dans data/generated/
 *   2. ne sont pas déjà publiées
 * - Pousse chaque doc dans Sanity en `status: 'published'`
 * - Respecte un cooldown de 24h entre exécutions (configurable via FORCE=1)
 * - Limite stricte : 4 pages max par exécution
 *
 * State : scripts/seo/data/state.json
 * Log   : scripts/seo/data/publish.log
 *
 * Usage : npm run seo:publish [-- --count=3] [-- --force]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { getWriteClient } from './lib/sanity-write'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: join(__dirname, '..', '..', '.env.local') })

const DATA_DIR = join(__dirname, 'data')
const GEN_DIR = join(DATA_DIR, 'generated')
const KEYWORDS_FILE = join(DATA_DIR, 'keywords.json')
const STATE_FILE = join(DATA_DIR, 'state.json')
const LOG_FILE = join(DATA_DIR, 'publish.log')

const MAX_BATCH = 4
const COOLDOWN_MS = 24 * 60 * 60 * 1000

interface State {
  lastPublishedAt: string | null
  publishedRaces: string[]
  pendingRaces: string[]
}

interface KeywordRow {
  race: string
  slug_race: string
  priorite: number
  volume_estime: string
}

interface SanityDocPayload {
  race: string
  slugRace: string
  title: string
  slug: { _type: 'slug'; current: string }
  metaTitle: string
  metaDescription: string
  intro: unknown[]
  approche: unknown[]
  frequence: unknown[]
  faq: unknown[]
  typePoil: string
  gabarit: string
}

function loadState(): State {
  if (!existsSync(STATE_FILE))
    return { lastPublishedAt: null, publishedRaces: [], pendingRaces: [] }
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf8')) as State
  } catch {
    return { lastPublishedAt: null, publishedRaces: [], pendingRaces: [] }
  }
}

function saveState(s: State) {
  mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(STATE_FILE, JSON.stringify(s, null, 2), 'utf8')
}

function log(line: string) {
  appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${line}\n`, 'utf8')
}

function parseArgs(): { count: number; force: boolean } {
  const args = process.argv.slice(2)
  let count = 3
  let force = false
  for (const a of args) {
    if (a === '--force' || a === '-f') force = true
    const m = a.match(/^--count=(\d+)$/)
    if (m) count = Math.min(Number(m[1]), MAX_BATCH)
  }
  return { count: Math.min(count, MAX_BATCH), force }
}

async function main() {
  if (!existsSync(KEYWORDS_FILE)) {
    console.error('[seo:publish] keywords.json absent — abort')
    process.exit(1)
  }
  const { count, force } = parseArgs()
  const state = loadState()

  if (!force && state.lastPublishedAt) {
    const elapsed = Date.now() - new Date(state.lastPublishedAt).getTime()
    if (elapsed < COOLDOWN_MS) {
      const hRemaining = Math.ceil((COOLDOWN_MS - elapsed) / 3600_000)
      console.log(`[seo:publish] cooldown actif — encore ~${hRemaining}h (use --force pour bypass)`)
      return
    }
  }

  const keywords = JSON.parse(readFileSync(KEYWORDS_FILE, 'utf8')) as KeywordRow[]
  const published = new Set(state.publishedRaces)

  const candidates = keywords
    .filter((k) => !published.has(k.slug_race))
    .filter((k) => existsSync(join(GEN_DIR, `${k.slug_race}.json`)))
    .slice(0, count)

  if (candidates.length === 0) {
    console.log('[seo:publish] aucune race candidate (contenu généré + non publiée) — rien à faire')
    return
  }

  const client = getWriteClient()
  const nowIso = new Date().toISOString()
  let pushed = 0

  for (const kw of candidates) {
    const docPath = join(GEN_DIR, `${kw.slug_race}.json`)
    const doc = JSON.parse(readFileSync(docPath, 'utf8')) as SanityDocPayload

    // ID stable basé sur slugRace pour idempotence
    const docId = `seoPage.${kw.slug_race}`

    const payload = {
      _id: docId,
      _type: 'seoPage',
      ...doc,
      publishedAt: nowIso,
      status: 'published',
    }

    try {
      await client.createOrReplace(payload)
      published.add(kw.slug_race)
      pushed++
      log(`PUBLISH ${kw.slug_race} → /toilettage/${kw.slug_race}`)
      console.log(`  ✓ ${kw.race} → /toilettage/${kw.slug_race}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      log(`FAIL ${kw.slug_race} — ${msg}`)
      console.warn(`  ✗ ${kw.race} : ${msg}`)
    }
  }

  state.publishedRaces = Array.from(published)
  state.pendingRaces = keywords.filter((k) => !published.has(k.slug_race)).map((k) => k.slug_race)
  if (pushed > 0) state.lastPublishedAt = nowIso
  saveState(state)

  console.log(`[seo:publish] ${pushed} pages publiées · ${state.pendingRaces.length} restantes`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
