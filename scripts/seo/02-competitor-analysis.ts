/**
 * Phase 2 — Competitor Analysis
 *
 * Pour chaque race top-15, fetch les 3 premiers résultats Google via SerpAPI
 * et analyse leur structure (FAQ, schema, longueur, H2).
 *
 * Output :
 *  - scripts/seo/data/competitors.json (analyse human-readable)
 *  - scripts/seo/data/seo.db.json (historique pour monitoring)
 *
 * Usage : npm run seo:competitors
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { serpSearch } from './lib/serpapi'
import { loadDb, saveDb, type CompetitorRow } from './lib/db'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: join(__dirname, '..', '..', '.env.local') })

const DATA_DIR = join(__dirname, 'data')
const KEYWORDS_FILE = join(DATA_DIR, 'keywords.json')
const COMPETITORS_FILE = join(DATA_DIR, 'competitors.json')
const DB_FILE = join(DATA_DIR, 'seo.db.json')
const SERPAPI_KEY = process.env.SERPAPI_KEY ?? process.env.SERPAPI_API_KEY ?? ''

interface KeywordRow {
  race: string
  slug_race: string
  requete_principale: string
  volume_estime: string
  priorite: number
}

interface CompetitorAnalysis {
  url: string
  title: string
  has_faq: boolean
  has_schema: boolean
  word_count: number
  h2_count: number
  position: number
}

interface RaceReport {
  race: string
  requete: string
  top_3_concurrents: CompetitorAnalysis[]
  opportunite: 'high' | 'medium' | 'low'
  gap_identifie: string
}

const TOP_N_RACES = 15
const SERP_DELAY_MS = 1500
const FETCH_DELAY_MS = 800
const FETCH_TIMEOUT_MS = 12000

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function fetchPageHtml(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MerciMurphyBot/1.0; +https://mercimurphy.com/bot)',
        Accept: 'text/html',
      },
      redirect: 'follow',
    })
    clearTimeout(timer)
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

function analyzeHtml(
  html: string,
  position: number,
  url: string,
  title: string
): CompetitorAnalysis {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
  const plain = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const wordCount = plain ? plain.split(' ').length : 0
  const h2Count = (html.match(/<h2\b/gi) ?? []).length
  const hasSchema =
    /application\/ld\+json/i.test(html) && /(FAQPage|Service|LocalBusiness)/i.test(html)
  const hasFaq =
    /faq/i.test(plain) || /<details\b/i.test(html) || /class=["'][^"']*(faq|accordion)/i.test(html)
  return {
    url,
    title,
    position,
    word_count: wordCount,
    h2_count: h2Count,
    has_faq: hasFaq,
    has_schema: hasSchema,
  }
}

function buildOpportunity(top: CompetitorAnalysis[]): {
  opportunite: RaceReport['opportunite']
  gap_identifie: string
} {
  if (top.length === 0) {
    return {
      opportunite: 'high',
      gap_identifie: 'Aucun concurrent local identifié sur cette requête',
    }
  }
  const avgWords = top.reduce((s, c) => s + c.word_count, 0) / top.length
  const faqCount = top.filter((c) => c.has_faq).length
  const schemaCount = top.filter((c) => c.has_schema).length
  const gaps: string[] = []
  if (faqCount === 0) gaps.push('Aucun concurrent avec FAQ structurée')
  if (schemaCount === 0) gaps.push('Aucun schema.org pertinent détecté')
  if (avgWords < 500) gaps.push(`Contenu concurrents court (~${Math.round(avgWords)} mots)`)
  const opp: RaceReport['opportunite'] =
    gaps.length >= 2 ? 'high' : gaps.length === 1 ? 'medium' : 'low'
  return {
    opportunite: opp,
    gap_identifie: gaps.join(' · ') || 'Concurrence solide — différenciation éditoriale requise',
  }
}

async function processRace(kw: KeywordRow): Promise<{ report: RaceReport; rows: CompetitorRow[] }> {
  console.log(`[seo:competitors] → ${kw.requete_principale}`)
  const serp = await serpSearch(kw.requete_principale, SERPAPI_KEY)
  if (serp.error || !serp.organic_results) {
    console.warn(`  ⚠ SerpAPI error : ${serp.error ?? 'no results'}`)
    return {
      report: {
        race: kw.race,
        requete: kw.requete_principale,
        top_3_concurrents: [],
        opportunite: 'high',
        gap_identifie: 'SerpAPI indisponible — vérifier manuellement',
      },
      rows: [],
    }
  }
  const top3 = serp.organic_results.slice(0, 3)
  const analyses: CompetitorAnalysis[] = []
  for (const r of top3) {
    await sleep(FETCH_DELAY_MS)
    const html = await fetchPageHtml(r.link)
    if (!html) {
      analyses.push({
        url: r.link,
        title: r.title,
        position: r.position,
        word_count: 0,
        h2_count: 0,
        has_faq: false,
        has_schema: false,
      })
      continue
    }
    analyses.push(analyzeHtml(html, r.position, r.link, r.title))
  }
  const { opportunite, gap_identifie } = buildOpportunity(analyses)
  const scrapedAt = new Date().toISOString()
  return {
    report: {
      race: kw.race,
      requete: kw.requete_principale,
      top_3_concurrents: analyses,
      opportunite,
      gap_identifie,
    },
    rows: analyses.map((a) => ({
      race: kw.race,
      requete: kw.requete_principale,
      url: a.url,
      title: a.title,
      has_faq: a.has_faq,
      has_schema: a.has_schema,
      word_count: a.word_count,
      h2_count: a.h2_count,
      position: a.position,
      scraped_at: scrapedAt,
    })),
  }
}

async function main() {
  if (!SERPAPI_KEY) {
    console.error('[seo:competitors] SERPAPI_KEY manquant dans .env.local — abort')
    process.exit(1)
  }
  if (!existsSync(KEYWORDS_FILE)) {
    console.error(
      `[seo:competitors] ${KEYWORDS_FILE} introuvable — lance d'abord npm run seo:keywords`
    )
    process.exit(1)
  }

  mkdirSync(DATA_DIR, { recursive: true })
  const keywords = JSON.parse(readFileSync(KEYWORDS_FILE, 'utf8')) as KeywordRow[]
  const targets = keywords.slice(0, TOP_N_RACES)
  const db = loadDb(DB_FILE)
  const reports: RaceReport[] = []

  for (const kw of targets) {
    const { report, rows } = await processRace(kw)
    reports.push(report)
    db.competitors.push(...rows)
    await sleep(SERP_DELAY_MS)
  }

  writeFileSync(COMPETITORS_FILE, JSON.stringify(reports, null, 2), 'utf8')
  saveDb(DB_FILE, db)
  console.log(`[seo:competitors] ${reports.length} races analysées → ${COMPETITORS_FILE}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
