/**
 * Phase 1 — Keyword Research
 *
 * Génère scripts/seo/data/keywords.json : matrice race × intention pour Paris.
 *
 * Usage : npm run seo:keywords
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BREEDS } from './lib/breeds'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'data')
const OUTPUT = join(DATA_DIR, 'keywords.json')

interface KeywordRow {
  race: string
  slug_race: string
  type_poil: string
  gabarit: string
  requete_principale: string
  requetes_secondaires: string[]
  volume_estime: string
  priorite: 1 | 2 | 3
}

function buildRow(b: (typeof BREEDS)[number]): KeywordRow {
  const r = b.race
  return {
    race: b.race,
    slug_race: b.slugRace,
    type_poil: b.typePoil,
    gabarit: b.gabarit,
    requete_principale: `toilettage ${r} Paris`,
    requetes_secondaires: [
      `toiletteur ${r} Paris`,
      `bain ${r} Paris`,
      `coupe poil ${r} Paris`,
      `entretien pelage ${r} Paris`,
      `spa canin ${r} Paris`,
    ],
    volume_estime: b.volumeEstime,
    priorite: b.priorite,
  }
}

function priorityRank(v: string): number {
  return v === 'high' ? 0 : v === 'medium' ? 1 : 2
}

function main() {
  mkdirSync(DATA_DIR, { recursive: true })

  const rows = BREEDS.map(buildRow).sort((a, b) => {
    if (a.priorite !== b.priorite) return a.priorite - b.priorite
    return priorityRank(a.volume_estime) - priorityRank(b.volume_estime)
  })

  writeFileSync(OUTPUT, JSON.stringify(rows, null, 2), 'utf8')
  console.log(`[seo:keywords] ${rows.length} races écrites → ${OUTPUT}`)
}

main()
