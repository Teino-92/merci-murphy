/**
 * Phase 7 — Réécriture humaine
 *
 * Réécrit les seoPage existants pour :
 *  - virer toutes les tournures IA
 *  - virer tous les tirets longs (—, –) et remplacer par ponctuation normale
 *  - voix Margot : toiletteuse Paris 9e, ton humain, simple, direct
 *
 * Usage : tsx scripts/seo/07-rewrite-human.ts [--slug=labrador]
 */

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { callClaude, extractText as extractClaudeText } from './lib/anthropic'
import { textToBlocks } from './lib/portable-text'
import { getWriteClient } from './lib/sanity-write'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: join(__dirname, '..', '..', '.env.local') })

const slugArg = process.argv.find((a) => a.startsWith('--slug='))?.split('=')[1]

const SYSTEM_PROMPT = `Tu es Margot, fondatrice et toiletteuse senior de merci murphy®, spa canin rue Victor Massé Paris 9e.

Tu réécris des textes pour qu'ils sonnent comme toi, pas comme une IA.

Règles STRICTES :
1. INTERDIT : tirets longs cadratin (—) et tirets demi-cadratin (–). Utilise virgules, points, parenthèses ou deux-points à la place.
2. INTERDIT : ces tournures IA (jamais, dans aucune forme) :
   - "nous savons que", "il est important de", "il convient de"
   - "véritable", "vraie machine à", "spectaculaire", "incroyable"
   - "n'hésitez pas à", "c'est une question qu'on nous pose souvent"
   - "véritablement", "particulièrement", "notamment", "naturellement"
   - "en effet", "par ailleurs", "en outre", "de surcroît"
   - "à savoir", "c'est-à-dire", "à proprement parler"
   - listes triples rythmées artificielles ("X, Y et Z" répétés)
3. INTERDIT : adjectifs grandiloquents en chaîne. Pas plus d'un adjectif par nom.
4. INTERDIT : phrases qui commencent par "Lorsque" ou "Afin de".
5. Phrases courtes. Direct. Concret. Tu parles à un client parisien intelligent qui aime son chien.
6. Tu peux dire "je", "on", "nous" (équipe merci murphy®). Naturel.
7. Vocabulaire métier OK (cardage, démuage, sous-poil) mais expliqué simplement quand utile.

Tu reçois un JSON avec intro, approche, frequence, faq. Tu réécris CHAQUE champ texte sans changer la structure JSON, sans changer les questions FAQ.

Réponds UNIQUEMENT avec JSON valide, même structure que l'entrée. Pas de markdown, pas de commentaire.`

interface SeoDoc {
  _id: string
  race: string
  slugRace: string
  intro: { _key: string; children: { text: string }[] }[]
  approche: { _key: string; children: { text: string }[] }[]
  frequence: { _key: string; children: { text: string }[] }[]
  faq: { _key: string; question: string; reponse: { children: { text: string }[] }[] }[]
}

interface RewriteInput {
  race: string
  intro: string
  approche: string
  frequence: string
  faq: { question: string; reponse: string }[]
}

interface RewriteOutput {
  intro: string
  approche: string
  frequence: string
  faq: { question: string; reponse: string }[]
}

function extractText(blocks: { children: { text: string }[] }[]): string {
  return blocks.map((b) => b.children.map((c) => c.text).join('')).join('\n\n')
}

function stripDashes(s: string): string {
  return s
    .replace(/\s—\s/g, ', ')
    .replace(/\s–\s/g, ', ')
    .replace(/—/g, ',')
    .replace(/–/g, ',')
    .replace(/\s*«\s*/g, ' « ')
    .replace(/\s*»\s*/g, ' » ')
    .replace(/ +/g, ' ')
    .replace(/ ,/g, ',')
    .replace(/,,+/g, ',')
    .trim()
}

function safeJsonParse(s: string): RewriteOutput {
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('JSON brackets not found')
  const slice = s.slice(start, end + 1)
  const repaired = slice
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/("(?:[^"\\]|\\.)*?")/g, (m) => m.replace(/\n/g, '\\n').replace(/\r/g, '\\r'))
  return JSON.parse(repaired) as RewriteOutput
}

async function rewriteDoc(doc: SeoDoc): Promise<void> {
  console.log(`[seo:rewrite] → ${doc.race}`)

  const input: RewriteInput = {
    race: doc.race,
    intro: extractText(doc.intro),
    approche: extractText(doc.approche),
    frequence: extractText(doc.frequence),
    faq: doc.faq.map((f) => ({
      question: f.question,
      reponse: extractText(f.reponse),
    })),
  }

  const userPrompt = `Race : ${doc.race}

Réécris les textes ci-dessous. Préserve les infos techniques (fréquences, races, durées, étapes du toilettage). Mais vire toutes les tournures IA et tous les tirets longs.

Input JSON :
${JSON.stringify(input, null, 2)}

Output JSON ({ intro, approche, frequence, faq: [{question, reponse}] }) :`

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY manquant')

  const res = await callClaude({
    apiKey,
    model: process.env.SEO_CLAUDE_MODEL ?? 'claude-sonnet-4-6',
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
    maxTokens: 4096,
  })

  const text = extractClaudeText(res)
  const parsed = safeJsonParse(text)

  // Strip dashes defensively even if Claude obeyed
  const cleanIntro = stripDashes(parsed.intro)
  const cleanApproche = stripDashes(parsed.approche)
  const cleanFrequence = stripDashes(parsed.frequence)
  const cleanFaq = parsed.faq.map((f, i) => ({
    question: doc.faq[i]?.question ?? f.question, // preserve original question
    reponse: stripDashes(f.reponse),
  }))

  const client = getWriteClient()
  await client
    .patch(doc._id)
    .set({
      intro: textToBlocks(cleanIntro),
      approche: textToBlocks(cleanApproche),
      frequence: textToBlocks(cleanFrequence),
      faq: cleanFaq.map((f) => ({
        _type: 'faqItem',
        _key: Math.random().toString(36).slice(2, 14),
        question: f.question,
        reponse: textToBlocks(f.reponse),
      })),
    })
    .commit()

  console.log(
    `  ✓ ${doc.race} réécrit + patché Sanity (in: ${res.usage.input_tokens}, out: ${res.usage.output_tokens})`
  )
}

async function main() {
  const client = getWriteClient()
  const filter = slugArg ? `&& slugRace == "${slugArg}"` : ''
  const docs = await client.fetch<SeoDoc[]>(
    `*[_type == "seoPage" ${filter}]{
      _id, race, slugRace,
      intro, approche, frequence,
      faq[]{ _key, question, reponse }
    }`
  )

  if (docs.length === 0) {
    console.error('[seo:rewrite] aucun doc trouvé')
    process.exit(1)
  }

  console.log(`[seo:rewrite] ${docs.length} doc(s) à réécrire`)

  for (const doc of docs) {
    try {
      await rewriteDoc(doc)
      await new Promise((r) => setTimeout(r, 1500))
    } catch (e) {
      console.error(`  ✗ ${doc.race} échoué : ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  console.log('[seo:rewrite] terminé')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
