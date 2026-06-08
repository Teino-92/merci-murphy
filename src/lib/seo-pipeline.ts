/**
 * SEO Pipeline — exécuté côté serveur (cron route Vercel).
 *
 * Flow :
 *  1. Charge queue races depuis seoState Sanity
 *  2. Pour N races (default 3) : génère contenu via Claude API + push doc seoPage Sanity
 *  3. Update seoState (publishedRaces, lastPublishedAt, lastRunStatus)
 *
 * Tout est stateless — pas de filesystem. Idempotent via createOrReplace + ID stable.
 */

import { createClient, type SanityClient } from '@sanity/client'
import { randomBytes } from 'node:crypto'
import { BREEDS, type BreedDef } from './seo-breeds'

const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'
const DEFAULT_MODEL = 'claude-sonnet-4-6'
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
const key = () => randomBytes(6).toString('hex')

// ─── Sanity client (write) ────────────────────────────────────────────────

function getWriteClient(): SanityClient {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
  const token = process.env.SANITY_API_TOKEN
  if (!projectId) throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID manquant')
  if (!token) throw new Error('SANITY_API_TOKEN manquant')
  return createClient({ projectId, dataset, apiVersion: '2024-01-01', token, useCdn: false })
}

// ─── State ────────────────────────────────────────────────────────────────

const STATE_ID = 'seoState.singleton'

interface SeoState {
  queue: string[]
  publishedRaces: string[]
  lastPublishedAt: string | null
  lastRunAt: string | null
  lastRunStatus: string | null
}

async function loadState(client: SanityClient): Promise<SeoState> {
  const doc = await client.fetch<Partial<SeoState> | null>(`*[_id == $id][0]`, { id: STATE_ID })
  if (!doc) {
    return {
      queue: BREEDS.map((b) => b.slugRace),
      publishedRaces: [],
      lastPublishedAt: null,
      lastRunAt: null,
      lastRunStatus: null,
    }
  }
  return {
    queue: doc.queue ?? [],
    publishedRaces: doc.publishedRaces ?? [],
    lastPublishedAt: doc.lastPublishedAt ?? null,
    lastRunAt: doc.lastRunAt ?? null,
    lastRunStatus: doc.lastRunStatus ?? null,
  }
}

async function saveState(client: SanityClient, state: SeoState) {
  await client.createOrReplace({
    _id: STATE_ID,
    _type: 'seoState',
    ...state,
  })
}

// ─── Portable Text helpers ────────────────────────────────────────────────

interface PortableBlock {
  _type: 'block'
  _key: string
  style: 'normal'
  markDefs: never[]
  children: { _type: 'span'; _key: string; text: string; marks: string[] }[]
}

function textToBlocks(text: string): PortableBlock[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((para) => ({
      _type: 'block' as const,
      _key: key(),
      style: 'normal' as const,
      markDefs: [],
      children: [{ _type: 'span' as const, _key: key(), text: para, marks: [] }],
    }))
}

// ─── Claude API ───────────────────────────────────────────────────────────

interface ClaudeResponse {
  content: { type: 'text'; text: string }[]
  usage: { input_tokens: number; output_tokens: number }
}

async function callClaude(prompt: string): Promise<ClaudeResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY manquant')
  const model = process.env.SEO_CLAUDE_MODEL ?? DEFAULT_MODEL

  const res = await fetch(ANTHROPIC_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Claude API HTTP ${res.status} : ${body.slice(0, 300)}`)
  }
  return (await res.json()) as ClaudeResponse
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

function safeJsonParse(raw: string): GeneratedContent | null {
  const text = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  const slice = text.slice(start, end + 1)
  try {
    return JSON.parse(slice)
  } catch {
    try {
      const repaired = slice
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/("(?:[^"\\]|\\.)*?")/g, (m) => m.replace(/\n/g, '\\n').replace(/\r/g, '\\r'))
      return JSON.parse(repaired)
    } catch {
      return null
    }
  }
}

function buildUserPrompt(b: BreedDef): string {
  return `Race : ${b.race}
Type de poil : ${b.typePoil}
Gabarit : ${b.gabarit}
Requête principale : "toilettage ${b.race} Paris"
Requêtes secondaires : "toiletteur ${b.race} Paris", "bain ${b.race} Paris", "coupe poil ${b.race} Paris", "entretien pelage ${b.race} Paris", "spa canin ${b.race} Paris"

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

// ─── Pipeline ─────────────────────────────────────────────────────────────

export interface RunResult {
  startedAt: string
  endedAt: string
  attempted: string[]
  published: string[]
  failed: { slugRace: string; error: string }[]
  remainingInQueue: number
  totalTokens: { input: number; output: number }
}

export async function runSeoPipeline(opts: { batchSize?: number } = {}): Promise<RunResult> {
  const batchSize = Math.min(opts.batchSize ?? 3, 4)
  const startedAt = new Date().toISOString()
  const client = getWriteClient()
  const state = await loadState(client)
  const publishedSet = new Set(state.publishedRaces)

  const breedsBySlug = new Map(BREEDS.map((b) => [b.slugRace, b]))
  const candidates = state.queue
    .filter((s) => !publishedSet.has(s) && breedsBySlug.has(s))
    .slice(0, batchSize)

  const result: RunResult = {
    startedAt,
    endedAt: '',
    attempted: candidates,
    published: [],
    failed: [],
    remainingInQueue: 0,
    totalTokens: { input: 0, output: 0 },
  }

  for (const slugRace of candidates) {
    const breed = breedsBySlug.get(slugRace)!
    try {
      const resp = await callClaude(buildUserPrompt(breed))
      result.totalTokens.input += resp.usage.input_tokens
      result.totalTokens.output += resp.usage.output_tokens

      const text = resp.content
        .filter((c) => c.type === 'text')
        .map((c) => c.text)
        .join('\n')
        .trim()

      const parsed = safeJsonParse(text)
      if (!parsed) throw new Error('JSON Claude invalide')

      const docId = `seoPage.${slugRace}`
      const slugCurrent = `toilettage-${slugRace}-paris`

      await client.createOrReplace({
        _id: docId,
        _type: 'seoPage',
        race: breed.race,
        slugRace,
        title: parsed.title,
        slug: { _type: 'slug', current: slugCurrent },
        metaTitle: parsed.metaTitle.slice(0, 60),
        metaDescription: parsed.metaDescription.slice(0, 160),
        intro: textToBlocks(parsed.intro),
        approche: textToBlocks(parsed.approche),
        frequence: textToBlocks(parsed.frequence),
        faq: parsed.faq.map((f) => ({
          _type: 'faqItem',
          _key: key(),
          question: f.question,
          reponse: textToBlocks(f.reponse),
        })),
        typePoil: breed.typePoil,
        gabarit: breed.gabarit,
        publishedAt: new Date().toISOString(),
        status: 'published',
      })

      publishedSet.add(slugRace)
      result.published.push(slugRace)
      await sleep(1500) // rate limit Claude
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      result.failed.push({ slugRace, error: msg })
    }
  }

  const allKnown = new Set(BREEDS.map((b) => b.slugRace))
  const newQueue = state.queue.filter((s) => !publishedSet.has(s) && allKnown.has(s))
  // Re-seed missing breeds (au cas où on ajoute des races dans BREEDS plus tard)
  for (const b of BREEDS)
    if (!publishedSet.has(b.slugRace) && !newQueue.includes(b.slugRace)) newQueue.push(b.slugRace)

  const endedAt = new Date().toISOString()
  result.endedAt = endedAt
  result.remainingInQueue = newQueue.length

  const status = `[${endedAt}] ${result.published.length} ok · ${result.failed.length} fail · ${newQueue.length} restantes`
  await saveState(client, {
    queue: newQueue,
    publishedRaces: Array.from(publishedSet),
    lastPublishedAt: result.published.length > 0 ? endedAt : state.lastPublishedAt,
    lastRunAt: endedAt,
    lastRunStatus: status,
  })

  return result
}
