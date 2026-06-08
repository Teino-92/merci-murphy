/**
 * SQLite store léger sans dépendance native — JSON-on-disk avec API minimale.
 * Permet de stocker l'historique competitor/monitoring sans imposer better-sqlite3.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

export interface CompetitorRow {
  race: string
  requete: string
  url: string
  title: string
  has_faq: boolean
  has_schema: boolean
  word_count: number
  h2_count: number
  position: number
  scraped_at: string
}

export interface MonitoringRow {
  race: string
  requete: string
  position: number
  scanned_at: string
}

interface DbShape {
  competitors: CompetitorRow[]
  monitoring: MonitoringRow[]
}

const EMPTY: DbShape = { competitors: [], monitoring: [] }

export function loadDb(path: string): DbShape {
  if (!existsSync(path)) return structuredClone(EMPTY)
  try {
    const raw = readFileSync(path, 'utf8')
    const parsed = JSON.parse(raw) as Partial<DbShape>
    return {
      competitors: parsed.competitors ?? [],
      monitoring: parsed.monitoring ?? [],
    }
  } catch {
    return structuredClone(EMPTY)
  }
}

export function saveDb(path: string, db: DbShape) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(db, null, 2), 'utf8')
}
