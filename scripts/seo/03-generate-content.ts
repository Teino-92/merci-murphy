/**
 * Phase 3 — Génération de contenu (Claude API)
 *
 * Pour chaque race de keywords.json, génère un document JSON prêt à pusher
 * dans Sanity (seoPage). Stockés dans scripts/seo/data/generated/<slug>.json
 *
 * Rate limit : 2s entre appels. Log : scripts/seo/data/generated.log
 *
 * Usage : npm run seo:generate -- [maxCount]
 *   maxCount = nombre max de races à générer (défaut : toutes les non encore générées)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { callClaude, extractText } from './lib/anthropic'
import { textToBlocks } from './lib/portable-text'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: join(__dirname, '..', '..', '.env.local') })

const DATA_DIR = join(__dirname, 'data')
const GEN_DIR = join(DATA_DIR, 'generated')
const KEYWORDS_FILE = join(DATA_DIR, 'keywords.json')
const LOG_FILE = join(DATA_DIR, 'generated.log')
const API_KEY = process.env.ANTHROPIC_API_KEY ?? ''
const MODEL = process.env.SEO_CLAUDE_MODEL ?? 'claude-sonnet-4-6'
const RATE_LIMIT_MS = 2000

interface KeywordRow {
  race: string
  slug_race: string
  type_poil: string
  gabarit: string
  requete_principale: string
  requetes_secondaires: string[]
  priorite: number
}

interface GeneratedContent {
  title: string
  metaTitle: string
  metaDescription: string
  intro: string
  approche: string
  frequence: string
  faq: { question: string; reponse: string }[]
}

export interface SanityReadyDoc {
  race: string
  slugRace: string
  title: string
  slug: { _type: 'slug'; current: string }
  metaTitle: string
  metaDescription: string
  intro: ReturnType<typeof textToBlocks>
  approche: ReturnType<typeof textToBlocks>
  frequence: ReturnType<typeof textToBlocks>
  faq: {
    _type: 'faqItem'
    _key: string
    question: string
    reponse: ReturnType<typeof textToBlocks>
  }[]
  typePoil: string
  gabarit: string
}

const SYSTEM_PROMPT = `Tu es un expert en contenu SEO pour le secteur du toilettage canin haut de gamme à Paris.
Tu rédiges pour merci murphy®, un spa canin premium situé rue Victor Massé à Paris 9e.

Ton style : chaleureux, expert, jamais clinique. On parle à des propriétaires qui chouchoutent leur chien.
Pas de superlatifs vides. Des infos concrètes sur la race (type de pelage, besoins spécifiques, fréquence recommandée).

Chaque page doit contenir :
1. Un H1 naturel intégrant la race et Paris
2. Un paragraphe d'intro (120-150 mots) sur les spécificités du pelage de cette race
3. Une section "Notre approche pour [race]" (150-200 mots) — ce que merci murphy fait différemment
4. Une section "À quelle fréquence faire toiletter un [race] à Paris ?" (100-150 mots)
5. Une FAQ de 4 questions/réponses spécifiques à la race (pas génériques)
6. Un meta title (60 car. max) et meta description (155 car. max)

Réponds UNIQUEMENT en JSON valide, sans markdown ni backticks.`

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function buildUserPrompt(kw: KeywordRow): string {
  return `Race : ${kw.race}
Type de poil : ${kw.type_poil}
Gabarit : ${kw.gabarit}
Requête principale : "${kw.requete_principale}"
Requêtes secondaires : ${kw.requetes_secondaires.map((r) => `"${r}"`).join(', ')}

Génère le contenu pour la page SEO de cette race. Structure JSON attendue :
{
  "title": "Toilettage [Race] à Paris — merci murphy®",
  "metaTitle": "...",
  "metaDescription": "...",
  "intro": "paragraphe de 120-150 mots avec spécificités du pelage",
  "approche": "150-200 mots sur ce que merci murphy fait différemment pour cette race",
  "frequence": "100-150 mots sur la fréquence recommandée",
  "faq": [
    { "question": "...", "reponse": "..." },
    { "question": "...", "reponse": "..." },
    { "question": "...", "reponse": "..." },
    { "question": "...", "reponse": "..." }
  ]
}`
}

function safeJsonParse(raw: string): GeneratedContent | null {
  let text = raw.trim()
  // Strip optional markdown fences au cas où
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
  // Extraire premier objet { ... }
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  const slice = text.slice(start, end + 1)
  try {
    return JSON.parse(slice)
  } catch {
    // Tentative récupération : remplace newlines littéraux dans strings + smart quotes
    try {
      const repaired = slice
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        // Échappe newlines bruts à l'intérieur de strings JSON
        .replace(/("(?:[^"\\]|\\.)*?")/g, (m) => m.replace(/\n/g, '\\n').replace(/\r/g, '\\r'))
      return JSON.parse(repaired)
    } catch {
      // Dump pour debug
      const dumpPath = join(GEN_DIR, `_failed_${Date.now()}.txt`)
      try {
        writeFileSync(dumpPath, raw, 'utf8')
        console.warn(`  [debug] raw output dump → ${dumpPath}`)
      } catch {}
      return null
    }
  }
}

import { randomBytes } from 'node:crypto'

function toSanityDoc(kw: KeywordRow, c: GeneratedContent): SanityReadyDoc {
  const slugCurrent = `toilettage-${kw.slug_race}-paris`
  return {
    race: kw.race,
    slugRace: kw.slug_race,
    title: c.title,
    slug: { _type: 'slug', current: slugCurrent },
    metaTitle: c.metaTitle.slice(0, 60),
    metaDescription: c.metaDescription.slice(0, 160),
    intro: textToBlocks(c.intro),
    approche: textToBlocks(c.approche),
    frequence: textToBlocks(c.frequence),
    faq: c.faq.map((f) => ({
      _type: 'faqItem' as const,
      _key: randomBytes(6).toString('hex'),
      question: f.question,
      reponse: textToBlocks(f.reponse),
    })),
    typePoil: kw.type_poil,
    gabarit: kw.gabarit,
  }
}

function log(line: string) {
  appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${line}\n`, 'utf8')
}

async function main() {
  if (!API_KEY) {
    console.error('[seo:generate] ANTHROPIC_API_KEY manquant')
    process.exit(1)
  }
  if (!existsSync(KEYWORDS_FILE)) {
    console.error('[seo:generate] keywords.json absent — lance seo:keywords')
    process.exit(1)
  }

  mkdirSync(GEN_DIR, { recursive: true })

  const maxCount = Number(process.argv[2] ?? Number.POSITIVE_INFINITY)
  const keywords = JSON.parse(readFileSync(KEYWORDS_FILE, 'utf8')) as KeywordRow[]
  const pending = keywords.filter((k) => !existsSync(join(GEN_DIR, `${k.slug_race}.json`)))
  const targets = pending.slice(0, Number.isFinite(maxCount) ? maxCount : pending.length)

  console.log(
    `[seo:generate] ${targets.length} races à générer (sur ${pending.length} pending) — model: ${MODEL}`
  )

  let okCount = 0
  let failCount = 0

  for (const kw of targets) {
    console.log(`  → ${kw.race}`)
    try {
      const resp = await callClaude({
        apiKey: API_KEY,
        model: MODEL,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildUserPrompt(kw) }],
        maxTokens: 4096,
      })
      const text = extractText(resp)
      const parsed = safeJsonParse(text)
      if (!parsed) {
        console.warn(`  ⚠ JSON invalide pour ${kw.race}`)
        log(`FAIL ${kw.slug_race} — JSON invalide`)
        failCount++
        continue
      }
      const doc = toSanityDoc(kw, parsed)
      writeFileSync(join(GEN_DIR, `${kw.slug_race}.json`), JSON.stringify(doc, null, 2), 'utf8')
      log(`OK ${kw.slug_race} — in=${resp.usage.input_tokens} out=${resp.usage.output_tokens}`)
      okCount++
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.warn(`  ⚠ ${kw.race} : ${msg}`)
      log(`FAIL ${kw.slug_race} — ${msg}`)
      failCount++
    }
    await sleep(RATE_LIMIT_MS)
  }

  console.log(`[seo:generate] terminé — ${okCount} ok / ${failCount} fail`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
