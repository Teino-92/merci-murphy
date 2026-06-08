/**
 * Phase 5 — Monitoring hebdo
 *
 * Pour chaque page publiée :
 *  - check position Google de mercimurphy.com via SerpAPI
 *  - met à jour googlePosition + lastChecked sur le doc Sanity
 *  - compare à l'historique pour calculer évolution
 *  - génère rapport JSON
 *
 * Usage : npm run seo:monitor
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { getWriteClient } from './lib/sanity-write'
import { serpSearch, findRankingPosition } from './lib/serpapi'
import { loadDb, saveDb, type MonitoringRow } from './lib/db'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: join(__dirname, '..', '..', '.env.local') })

const DATA_DIR = join(__dirname, 'data')
const DB_FILE = join(DATA_DIR, 'seo.db.json')
const SERPAPI_KEY = process.env.SERPAPI_KEY ?? process.env.SERPAPI_API_KEY ?? ''
const SERP_DELAY_MS = 1500

const DOMAIN = 'mercimurphy.com'

interface PublishedPageRef {
  _id: string
  race: string
  slugRace: string
}

interface PageReport {
  race: string
  url: string
  position_actuelle: number
  position_precedente: number | null
  evolution: string
  action_recommandee: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function evolutionStr(curr: number, prev: number | null): string {
  if (curr === -1) return 'hors top 10'
  if (prev === null || prev === -1) return 'baseline'
  const diff = prev - curr // positif = on remonte
  return diff > 0 ? `+${diff}` : String(diff)
}

function recommandation(pos: number, prev: number | null): string {
  if (pos === -1) return 'Hors top 10 — enrichir contenu + maillage interne'
  if (pos > 10) return 'Position faible — vérifier intent match + meta'
  if (pos > 5 && prev !== null && prev > 0 && prev < pos)
    return 'Régression — vérifier nouveaux concurrents'
  if (pos <= 3) return 'Top 3 — maintenir'
  return 'Position acceptable — itérer FAQ pour gagner SERP features'
}

async function main() {
  if (!SERPAPI_KEY) {
    console.error('[seo:monitor] SERPAPI_KEY manquant')
    process.exit(1)
  }

  mkdirSync(DATA_DIR, { recursive: true })
  const client = getWriteClient()

  const pages = await client.fetch<PublishedPageRef[]>(
    `*[_type == "seoPage" && status == "published"] { _id, race, slugRace }`
  )
  if (pages.length === 0) {
    console.log('[seo:monitor] aucune page publiée')
    return
  }

  const db = loadDb(DB_FILE)
  const reports: PageReport[] = []
  const now = new Date().toISOString()
  const todayDate = now.slice(0, 10)

  for (const page of pages) {
    const requete = `toilettage ${page.race} Paris`
    console.log(`[seo:monitor] → ${requete}`)
    const serp = await serpSearch(requete, SERPAPI_KEY)
    const pos = findRankingPosition(serp.organic_results, (u) => u.includes(DOMAIN))

    const prevRow = [...db.monitoring]
      .filter((m) => m.race === page.race && m.requete === requete)
      .sort((a, b) => b.scanned_at.localeCompare(a.scanned_at))[0]
    const prev = prevRow ? prevRow.position : null

    const newRow: MonitoringRow = { race: page.race, requete, position: pos, scanned_at: now }
    db.monitoring.push(newRow)

    reports.push({
      race: page.race,
      url: `/toilettage/${page.slugRace}`,
      position_actuelle: pos,
      position_precedente: prev,
      evolution: evolutionStr(pos, prev),
      action_recommandee: recommandation(pos, prev),
    })

    try {
      await client
        .patch(page._id)
        .set({ googlePosition: pos === -1 ? null : pos, lastChecked: now })
        .commit()
    } catch (e) {
      console.warn(`  ⚠ patch Sanity échoué : ${e instanceof Error ? e.message : String(e)}`)
    }

    await sleep(SERP_DELAY_MS)
  }

  saveDb(DB_FILE, db)
  const reportPath = join(DATA_DIR, `report-${todayDate}.json`)
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        date: todayDate,
        pages: reports,
        pages_mortes: reports.filter((r) => r.position_actuelle === -1).map((r) => r.race),
      },
      null,
      2
    ),
    'utf8'
  )
  console.log(`[seo:monitor] ${reports.length} pages scannées → ${reportPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
