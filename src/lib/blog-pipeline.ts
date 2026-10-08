/**
 * Blog Pipeline — génération automatique d'articles (cron Vercel mar/jeu).
 *
 * Flow :
 *  1. Choix du sujet : mardi = race ("Vivre avec un X à Paris"), jeudi = sujet thématique (blogTopic)
 *  2. Génération Claude (sortie structurée Zod)
 *  3. Relecture : règles déterministes (style, médical, longueur, liens) + relecture Claude stricte
 *     → 1 réécriture max si problème
 *  4. Image Unsplash : double vérification vision (identification à l'aveugle + juge ciblé)
 *  5. Tout est OK → publié. Sinon → brouillon Sanity (drafts.*) + motifs dans reviewNotes.
 *
 * Garde-fou absolu : aucun conseil médical.
 */

import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import type { BetaContentBlockParam } from '@anthropic-ai/sdk/resources/beta/messages/messages'
import { createClient, type SanityClient } from '@sanity/client'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { BREEDS, type BreedDef } from '@/lib/seo-breeds'
import {
  searchUnsplash,
  trackUnsplashDownload,
  uploadUnsplashToSanity,
  type UnsplashCandidate,
} from '@/lib/unsplash'

const MODEL = 'claude-opus-5-5'
const SITE = 'https://mercimurphy.com'
const MIN_WORDS = 800
const MAX_WORDS = 1500
const IMAGE_CANDIDATES = 6
const IMAGE_MIN_CONFIDENCE = 0.85

const key = () => randomBytes(6).toString('hex')

// ─── Clients ──────────────────────────────────────────────────────────────

function getWriteClient(): SanityClient {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
  const token = process.env.SANITY_API_TOKEN
  if (!projectId) throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID manquant')
  if (!token) throw new Error('SANITY_API_TOKEN manquant')
  // perspective raw : on veut voir aussi les brouillons (évite de régénérer une race déjà en draft)
  return createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    token,
    useCdn: false,
    perspective: 'raw',
  })
}

let anthropicClient: Anthropic | null = null
function anthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY manquant')
  anthropicClient ??= new Anthropic()
  return anthropicClient
}

async function ask<T extends z.ZodType>(
  schema: T,
  content: string | BetaContentBlockParam[],
  opts: { system?: string; effort: 'low' | 'medium' | 'high'; maxTokens: number }
): Promise<z.infer<T>> {
  // Streaming : évite qu'une génération longue (non streamée) soit coupée côté réseau.
  const stream = anthropic().beta.messages.stream({
    model: MODEL,
    max_tokens: opts.maxTokens,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: opts.system,
    output_config: { format: betaZodOutputFormat(schema), effort: opts.effort },
    messages: [{ role: 'user', content }],
  })
  const res = await stream.finalMessage()
  if (res.stop_reason === 'refusal') throw new Error('Claude a refusé la requête')
  if (res.stop_reason === 'max_tokens') throw new Error('Réponse tronquée (max_tokens)')
  if (res.parsed_output == null) throw new Error('Sortie structurée vide')
  return res.parsed_output
}

// ─── Sujets ───────────────────────────────────────────────────────────────

export type BlogRunType = 'race' | 'topic'
type Animal = 'chien' | 'chat' | 'les-deux'

// Caniche : un seul article pour les 4 variantes (évite 4 textes quasi identiques).
const RACE_SKIP = new Set(['caniche-toy', 'caniche-moyen', 'caniche-grand'])
const RACE_LABEL: Record<string, string> = { 'caniche-nain': 'caniche' }

// Noms anglais pour la recherche Unsplash + la vérification de l'image.
const BREED_EN: Record<string, string[]> = {
  labrador: ['labrador retriever', 'labrador'],
  'golden-retriever': ['golden retriever'],
  'berger-allemand': ['german shepherd'],
  'bouledogue-francais': ['french bulldog'],
  chihuahua: ['chihuahua'],
  'yorkshire-terrier': ['yorkshire terrier', 'yorkie'],
  'caniche-toy': ['poodle'],
  'caniche-nain': ['poodle'],
  'caniche-moyen': ['poodle'],
  'caniche-grand': ['poodle'],
  'bichon-frise': ['bichon frise', 'bichon'],
  'shih-tzu': ['shih tzu'],
  'cavalier-king-charles': ['cavalier king charles spaniel', 'cavalier king charles'],
  'berger-australien': ['australian shepherd'],
  'border-collie': ['border collie'],
  beagle: ['beagle'],
  'cocker-spaniel': ['cocker spaniel'],
  'jack-russell': ['jack russell terrier', 'jack russell', 'parson russell terrier'],
  husky: ['siberian husky', 'husky'],
  teckel: ['dachshund'],
  'spitz-nain': ['pomeranian'],
  maltais: ['maltese'],
  'lhassa-apso': ['lhasa apso'],
  'west-highland-white-terrier': ['west highland white terrier', 'westie'],
  boxer: ['boxer'],
  samoyede: ['samoyed'],
  schnauzer: ['schnauzer'],
  pekinois: ['pekingese'],
  'setter-irlandais': ['irish setter', 'irish red setter'],
  dalmatien: ['dalmatian'],
  doberman: ['doberman', 'dobermann'],
  rottweiler: ['rottweiler'],
  'shar-pei': ['shar pei', 'shar-pei'],
}

interface RaceSubject {
  kind: 'race'
  breed: BreedDef
  label: string
  englishNames: string[]
}

interface BlogTopicDoc {
  _id: string
  title: string
  angle: string
  animal: Animal
  category: string
  months: number[] | null
}

interface TopicSubject {
  kind: 'topic'
  topic: BlogTopicDoc
}

type Subject = RaceSubject | TopicSubject

function parisMonth(): number {
  const m = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Paris', month: 'numeric' }).format(
    new Date()
  )
  return Number(m)
}

async function pickRace(client: SanityClient, forced?: string): Promise<RaceSubject | null> {
  const [publishedPages, usedRaces] = await Promise.all([
    client.fetch<string[]>(
      `*[_type == "seoPage" && status == "published" && !(_id in path("drafts.**"))].slugRace`
    ),
    // drafts inclus : une race en brouillon n'est pas régénérée
    client.fetch<string[]>(`*[_type == "post" && defined(race)].race`),
  ])
  const published = new Set(publishedPages)
  const used = new Set(usedRaces)

  const candidates = BREEDS.map((b, i) => ({ b, i }))
    .filter(({ b }) => published.has(b.slugRace) && !RACE_SKIP.has(b.slugRace))
    .filter(({ b }) => (forced ? b.slugRace === forced : !used.has(b.slugRace)))
    .sort((a, z2) => a.b.priorite - z2.b.priorite || a.i - z2.i)

  const first = candidates[0]
  if (!first) return null
  return {
    kind: 'race',
    breed: first.b,
    label: RACE_LABEL[first.b.slugRace] ?? first.b.race.toLowerCase(),
    englishNames: BREED_EN[first.b.slugRace] ?? [first.b.race.toLowerCase()],
  }
}

async function pickTopic(client: SanityClient): Promise<TopicSubject | null> {
  const topics = await client.fetch<BlogTopicDoc[]>(
    `*[_type == "blogTopic" && status == "todo" && !(_id in path("drafts.**"))] | order(_createdAt asc) {
      _id, title, angle, animal, category, months
    }`
  )
  const month = parisMonth()
  const seasonal = topics.find((t) => t.months?.includes(month))
  const evergreen = topics.find((t) => !t.months || t.months.length === 0)
  const topic = seasonal ?? evergreen
  return topic ? { kind: 'topic', topic } : null
}

// ─── Contexte de liens internes ───────────────────────────────────────────

interface LinkTarget {
  path: string
  label: string
}

const STATIC_LINKS: LinkTarget[] = [
  { path: '/toilettage', label: 'Toilettage (toutes les races)' },
  { path: '/toilettage-chien-paris', label: 'Toilettage chien à Paris' },
  { path: '/toilettage-chat-paris', label: 'Toilettage chat à Paris' },
  { path: '/creche-canine-paris', label: 'Crèche canine à Paris' },
  { path: '/services', label: 'Tous nos services' },
  { path: '/shop', label: 'La boutique' },
  { path: '/reservation', label: 'Réserver' },
  { path: '/concept', label: 'Le concept merci murphy' },
  { path: '/blog', label: 'Le blog' },
]

async function loadLinkTargets(client: SanityClient): Promise<LinkTarget[]> {
  const [services, breeds, posts] = await Promise.all([
    client.fetch<{ title: string; slug: string }[]>(
      `*[_type == "service" && defined(slug.current) && !(_id in path("drafts.**"))]{ title, "slug": slug.current }`
    ),
    client.fetch<{ race: string; slugRace: string }[]>(
      `*[_type == "seoPage" && status == "published" && !(_id in path("drafts.**"))]{ race, slugRace }`
    ),
    client.fetch<{ title: string; slug: string }[]>(
      `*[_type == "post" && !(_id in path("drafts.**")) && publishedAt <= now()] | order(publishedAt desc)[0...40]{ title, "slug": slug.current }`
    ),
  ])
  return [
    ...STATIC_LINKS,
    ...services.map((s) => ({ path: `/services/${s.slug}`, label: `Service : ${s.title}` })),
    ...breeds.map((b) => ({ path: `/toilettage/${b.slugRace}`, label: `Toilettage ${b.race}` })),
    ...posts.map((p) => ({ path: `/blog/${p.slug}`, label: `Article : ${p.title}` })),
  ]
}

// ─── Schémas de sortie ────────────────────────────────────────────────────

const ArticleSchema = z.object({
  title: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  excerpt: z.string(),
  intro: z.array(z.string()),
  sections: z.array(z.object({ heading: z.string(), paragraphs: z.array(z.string()) })),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })),
  imageQuery: z.string(),
  imageSubject: z.string(),
})
type Article = z.infer<typeof ArticleSchema>

const ReviewSchema = z.object({
  verdict: z.enum(['pass', 'fail']),
  issues: z.array(
    z.object({
      severity: z.enum(['bloquant', 'mineur']),
      rule: z.string(),
      excerpt: z.string(),
      fix: z.string(),
    })
  ),
})

const IdentifySchema = z.object({
  species: z.enum(['dog', 'cat', 'dog-and-cat', 'other', 'none']),
  breed: z.string(),
  hasTextOrWatermark: z.boolean(),
  prominentHumanFace: z.boolean(),
  isPhotograph: z.boolean(),
})

const JudgeSchema = z.object({
  isMatch: z.boolean(),
  confidence: z.number(),
  reason: z.string(),
  altFr: z.string(),
})

// ─── Prompts ──────────────────────────────────────────────────────────────

const FORBIDDEN_PHRASES = [
  'nous savons que',
  'il est important de',
  'il convient de',
  'véritable',
  'vraie machine à',
  'spectaculaire',
  'incroyable',
  "n'hésitez pas",
  "c'est une question qu'on nous pose souvent",
  'particulièrement',
  'notamment',
  'naturellement',
  'en effet',
  'par ailleurs',
  'en outre',
  'de surcroît',
  'à savoir',
  "c'est-à-dire",
  'à proprement parler',
]

// Vocabulaire médical : présence = brouillon, sans discussion.
const MEDICAL_PATTERNS: RegExp[] = [
  /\d+([.,]\d+)?\s?(mg|ml|ui)\b/i,
  /mg\/kg|g\/kg/i,
  /posologi/i,
  /dosage/i,
  /m[ée]dicament/i,
  /antibioti/i,
  /anti-?inflammatoire/i,
  /cortiso|cortico/i,
  /ibuprof/i,
  /parac[ée]tamol/i,
  /aspirine/i,
  /vermifug/i,
  /antiparasitaire/i,
  /vaccin/i,
  /traitement/i,
  /diagnosti/i,
  /dysplasie/i,
  /maladie/i,
  /pathologi/i,
  /sympt[oô]me/i,
  /infection/i,
  /allergi/i,
  /gu[ée]ri/i,
  /chirurgi/i,
  /st[ée]rilis/i,
  /ordonnance/i,
  /prescri/i,
]

const SYSTEM_PROMPT = `Tu écris pour le blog de merci murphy®, spa et boutique bien-être pour chiens et chats, 18 rue Victor Massé, Paris 9e (toilettage, crèche canine, boutique).

Voix : l'équipe parle ("nous", "on"). Ton direct, chaleureux, concret. Tu t'adresses à des propriétaires parisiens.

INTERDIT ABSOLU, CONSEILS MÉDICAUX :
- Aucun conseil de santé, aucune maladie, aucun symptôme, aucun diagnostic, aucun médicament, aucune dose, aucun vaccin, aucun vermifuge ou antiparasitaire, aucune prédisposition génétique, aucune chirurgie ni stérilisation, aucune ration alimentaire chiffrée.
- Mots interdits même en passant : maladie, symptôme, traitement, médicament, allergie, infection, dysplasie, pathologie, diagnostic, vaccin, guérir, chirurgie, stérilisation, posologie, dosage, prescription.
- Si un point touche à la santé, tu écris une seule phrase neutre qui renvoie au vétérinaire, sans rien affirmer d'autre.
- Pour la chaleur de l'été, tu parles de confort et d'organisation (horaires de balade, ombre, eau, sol brûlant), jamais de malaises ou d'urgences.

INTERDIT, FAITS INVENTÉS :
- Pas d'anecdote client inventée, pas de "une cliente nous a dit", pas de statistique, pas de pourcentage, pas de citation.
- Pas de chiffres précis risqués (poids, espérance de vie, dates exactes, kilomètres par jour). Préfère le qualitatif ou des fourchettes très prudentes.
- Lieux parisiens : cite seulement le bois de Boulogne, le bois de Vincennes, les quais de Seine, le canal Saint-Martin ou les squares de quartier. N'affirme aucun règlement précis (laisse, horaires, zones autorisées) : dis plutôt de vérifier l'affichage à l'entrée.
- Pas de promesse sur nos prestations au-delà de ce qui est évident (toilettage, crèche, boutique).

STYLE, RÈGLES STRICTES :
1. INTERDIT : tirets longs (—) et demi-cadratin (–). Utilise virgules, points, parenthèses ou deux-points.
2. INTERDIT : ${FORBIDDEN_PHRASES.map((p) => `"${p}"`).join(', ')}.
3. INTERDIT : listes triples rythmées artificielles, adjectifs grandiloquents en chaîne (un adjectif par nom max).
4. INTERDIT : phrases qui commencent par "Lorsque" ou "Afin de".
5. Phrases courtes. Concret. Paragraphes de 2 à 5 phrases.
6. Pas de markdown dans les textes (ni gras, ni titres, ni listes). Seule exception, les liens internes au format [texte du lien](/chemin).

LIENS INTERNES : 1 à 3 liens, uniquement vers les chemins fournis dans la liste, au format [texte](/chemin). Jamais de lien externe.

LONGUEUR : 900 à 1300 mots pour intro + sections (FAQ non comprise).
FAQ : 3 à 5 questions locales et concrètes, réponses de 2 à 4 phrases.
metaTitle : 60 caractères max. metaDescription : 150 caractères max. excerpt : 1 à 2 phrases, 250 caractères max.
imageQuery : requête Unsplash en anglais, 2 à 4 mots, centrée sur l'animal. imageSubject : description en anglais de la photo idéale.`

function linksBlock(links: LinkTarget[]): string {
  return links.map((l) => `- ${l.path} (${l.label})`).join('\n')
}

function racePrompt(s: RaceSubject, links: LinkTarget[]): string {
  const { breed, label } = s
  return `Écris un article "Vivre avec un ${label} à Paris".

Race : ${breed.race} (gabarit ${breed.gabarit}, poil ${breed.typePoil}).
Catégorie : Races.

Structure OBLIGATOIRE :
- intro : 2 ou 3 paragraphes courts. Origine, histoire, caractère. Le côté conte, on raconte la race comme une histoire, sans dates ni chiffres inventés.
- sections : le cœur de l'article, en version parisienne. Une section (heading H2 naturel) pour chacun de ces points, dans cet ordre :
  1. taille d'appartement
  2. besoin d'exercice
  3. parcs et balades adaptés
  4. chaleur l'été
  5. cohabitation avec les voisins
  Puis une DERNIÈRE section dont le heading contient le mot "pelage", avec UN SEUL paragraphe sur le pelage (description, entretien courant à la maison, rien de médical). Ne mets pas de lien dans cette section : le lien vers notre page toilettage est ajouté automatiquement.
- faq : 3 à 5 questions locales, par exemple "Un ${label} peut-il vivre en appartement à Paris ?".

Le title DOIT contenir "${label}" et "Paris".

Chemins autorisés pour les liens internes (n'utilise PAS /toilettage/${breed.slugRace}, il est déjà ajouté) :
${linksBlock(links.filter((l) => l.path !== `/toilettage/${breed.slugRace}`))}`
}

function topicPrompt(s: TopicSubject, links: LinkTarget[]): string {
  const { topic } = s
  const animal =
    topic.animal === 'chat' ? 'chats' : topic.animal === 'chien' ? 'chiens' : 'chiens et chats'
  return `Écris un article de blog sur ce sujet : "${topic.title}".

Angle / brief : ${topic.angle}
Animaux concernés : ${animal}.
Catégorie : ${topic.category}.

Structure :
- intro : 1 ou 2 paragraphes qui posent la situation concrète.
- sections : 3 à 5 sections avec un heading H2 naturel, ancrées dans la vie parisienne quand c'est pertinent.
- faq : 3 à 5 questions concrètes.

Chemins autorisés pour les liens internes :
${linksBlock(links)}`
}

function reviewPrompt(article: Article, subject: Subject): string {
  const expected =
    subject.kind === 'race'
      ? `Article race "Vivre avec un ${subject.label} à Paris". Structure attendue : intro (origine, histoire, caractère), sections parisiennes (appartement, exercice, parcs, chaleur l'été, voisins), dernière section "pelage" d'un seul paragraphe, FAQ locale.`
      : `Article thématique : "${subject.topic.title}". Brief : ${subject.topic.angle}`
  return `Tu es relecteur éditorial STRICT pour le blog de merci murphy® (spa canin et félin à Paris). L'article sera publié automatiquement sans relecture humaine si tu valides. Au moindre doute, verdict "fail".

Faits vrais sur merci murphy® (ne pas signaler) : spa et boutique bien-être pour chiens et chats, 18 rue Victor Massé, Paris 9e. Services : toilettage chien et chat, bains, crèche canine, boutique de produits. Les liens au format [texte](/chemin) sont des liens internes déjà validés.

Règles à vérifier :
1. AUCUN conseil médical. Échoue si l'article parle de maladie, symptôme, prédisposition, traitement, médicament, dose, vaccin, parasite, diagnostic, malaise, urgence, chirurgie, stérilisation, ration chiffrée, ou affirme un effet sur la santé. Seule exception tolérée : une phrase neutre qui renvoie vers le vétérinaire.
2. Aucun fait inventé : pas d'anecdote client, pas de statistique, pas de chiffre précis douteux, pas de règlement parisien affirmé (laisse, horaires, zones), pas de lieu parisien autre que bois de Boulogne, bois de Vincennes, quais de Seine, canal Saint-Martin, squares de quartier.
3. Exactitude : histoire et caractère de la race conformes au consensus. Toute affirmation que tu ne peux pas confirmer = fail.
4. Style : pas de tirets longs, pas de ${FORBIDDEN_PHRASES.map((p) => `"${p}"`).join(', ')}, pas de phrase qui commence par "Lorsque" ou "Afin de", pas de listes triples artificielles, pas d'adjectifs empilés, ton naturel et non promotionnel, aucune tournure qui sonne "texte d'IA".
5. Structure et sujet respectés. ${expected}
6. Français correct, pas de répétition lourde d'un paragraphe à l'autre.

Pour chaque problème : severity, rule (numéro + nom), excerpt (citation exacte), fix (correction proposée).
severity "bloquant" : règles 1, 2 et 3, mots ou tournures interdits de la règle 4, structure manquante ou hors sujet (règle 5).
severity "mineur" : répétitions, lourdeurs, tournures améliorables, ton un peu promotionnel.
verdict "fail" seulement s'il existe au moins un problème bloquant. Si tout est bon : verdict "pass" et issues vide.

ARTICLE (JSON) :
${JSON.stringify(article, null, 2)}`
}

function rewritePrompt(article: Article, issues: string[]): string {
  return `Voici un article et la liste des problèmes relevés en relecture. Corrige TOUS les problèmes, garde la structure, la longueur et les liens valides. Ne réintroduis aucun terme médical. Renvoie l'article complet corrigé.

PROBLÈMES :
${issues.map((i) => `- ${i}`).join('\n')}

ARTICLE (JSON) :
${JSON.stringify(article, null, 2)}`
}

// ─── Vérifications déterministes ──────────────────────────────────────────

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function stripDashes(s: string): string {
  return s
    .replace(/\s[—–]\s/g, ', ')
    .replace(/[—–]/g, ',')
    .replace(/ +/g, ' ')
    .replace(/ ,/g, ',')
    .replace(/,,+/g, ',')
    .trim()
}

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g

function plainText(s: string): string {
  return s.replace(LINK_RE, '$1')
}

function bodyParagraphs(a: Article): string[] {
  return [...a.intro, ...a.sections.flatMap((s) => [s.heading, ...s.paragraphs])]
}

function allTexts(a: Article): string[] {
  return [
    a.title,
    a.metaTitle,
    a.metaDescription,
    a.excerpt,
    ...bodyParagraphs(a),
    ...a.faq.flatMap((f) => [f.question, f.answer]),
  ]
}

function countWords(a: Article): number {
  return bodyParagraphs(a).map(plainText).join(' ').split(/\s+/).filter(Boolean).length
}

function cleanArticle(a: Article): Article {
  return {
    ...a,
    title: stripDashes(a.title),
    metaTitle: stripDashes(a.metaTitle),
    metaDescription: stripDashes(a.metaDescription),
    excerpt: stripDashes(a.excerpt),
    intro: a.intro.map(stripDashes),
    sections: a.sections.map((s) => ({
      heading: stripDashes(s.heading),
      paragraphs: s.paragraphs.map(stripDashes),
    })),
    faq: a.faq.map((f) => ({ question: stripDashes(f.question), answer: stripDashes(f.answer) })),
  }
}

// Section pelage d'un seul paragraphe (structure demandée) : on fusionne si besoin.
function normalizeArticle(raw: Article, subject: Subject): Article {
  const a = cleanArticle(raw)
  if (subject.kind !== 'race' || a.sections.length === 0) return a
  const last = a.sections[a.sections.length - 1]
  if (!/pelage/i.test(last.heading) || last.paragraphs.length <= 1) return a
  return {
    ...a,
    sections: [
      ...a.sections.slice(0, -1),
      { heading: last.heading, paragraphs: [last.paragraphs.join(' ')] },
    ],
  }
}

function lintArticle(a: Article, subject: Subject, allowedPaths: Set<string>): string[] {
  const issues: string[] = []
  const texts = allTexts(a)
  const joined = texts.map(plainText).join('\n')
  const lower = joined.toLowerCase()

  for (const re of MEDICAL_PATTERNS) {
    const m = joined.match(re)
    if (m) issues.push(`[médical] terme interdit détecté : « ${m[0]} »`)
  }

  for (const p of FORBIDDEN_PHRASES) {
    const re = new RegExp(
      `(^|[^a-zà-ÿ])${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-zà-ÿ]|$)`,
      'i'
    )
    if (re.test(lower)) issues.push(`[style] tournure interdite : « ${p} »`)
  }

  const badStart = joined.match(/(^|[.!?]\s+|\n)(Lorsque|Afin de)\b/)
  if (badStart) issues.push(`[style] phrase qui commence par « ${badStart[2]} »`)

  const words = countWords(a)
  if (words < MIN_WORDS || words > MAX_WORDS)
    issues.push(`[longueur] ${words} mots (attendu ${MIN_WORDS}–${MAX_WORDS})`)

  if (a.faq.length < 3 || a.faq.length > 5)
    issues.push(`[faq] ${a.faq.length} questions (attendu 3 à 5)`)
  if (a.metaTitle.length > 60) issues.push(`[seo] metaTitle ${a.metaTitle.length} car. (max 60)`)
  if (a.metaDescription.length > 160)
    issues.push(`[seo] metaDescription ${a.metaDescription.length} car. (max 160)`)
  if (a.excerpt.length > 300) issues.push(`[seo] excerpt ${a.excerpt.length} car. (max 300)`)
  if (a.intro.length === 0 || a.sections.length < 3)
    issues.push('[structure] intro ou sections manquantes')

  const links = texts.flatMap((t) => Array.from(t.matchAll(LINK_RE)).map((m) => m[2]))
  for (const href of links) {
    if (!allowedPaths.has(href)) issues.push(`[liens] lien non autorisé : ${href}`)
  }
  if (links.length > 4) issues.push(`[liens] ${links.length} liens (max 3)`)
  if (/\*\*|^#|^- /m.test(joined)) issues.push('[style] markdown dans le texte')

  if (subject.kind === 'race') {
    const t = normalize(a.title)
    if (!t.includes(normalize(subject.label)) || !t.includes('paris'))
      issues.push(`[structure] le titre doit contenir « ${subject.label} » et « Paris »`)
    const coat = a.sections[a.sections.length - 1]
    if (!coat || !/pelage/i.test(coat.heading))
      issues.push('[structure] dernière section « pelage » absente')
    else if (coat.paragraphs.length !== 1)
      issues.push(`[structure] section pelage : ${coat.paragraphs.length} paragraphes (attendu 1)`)
  }

  return issues
}

// ─── Génération + relecture ───────────────────────────────────────────────

interface CheckResult {
  blocking: string[]
  minor: string[]
}

async function checkArticle(
  a: Article,
  subject: Subject,
  allowed: Set<string>
): Promise<CheckResult> {
  const lint = lintArticle(a, subject, allowed)
  const review = await ask(ReviewSchema, reviewPrompt(a, subject), {
    effort: 'medium',
    maxTokens: 8000,
  })
  const fmt = (i: (typeof review.issues)[number]) =>
    `[relecture] ${i.rule} : « ${i.excerpt} » → ${i.fix}`
  const blocking = review.issues.filter((i) => i.severity === 'bloquant').map(fmt)
  if (review.verdict === 'fail' && blocking.length === 0)
    blocking.push('[relecture] verdict fail sans problème bloquant détaillé')
  return {
    blocking: [...lint, ...blocking],
    minor: review.issues.filter((i) => i.severity === 'mineur').map(fmt),
  }
}

interface WrittenArticle {
  article: Article
  issues: string[]
  rewritten: boolean
}

async function writeArticle(
  first: Article,
  subject: Subject,
  allowed: Set<string>
): Promise<WrittenArticle> {
  const c1 = await checkArticle(first, subject, allowed)
  if (c1.blocking.length === 0 && c1.minor.length === 0)
    return { article: first, issues: [], rewritten: false }

  // Une seule réécriture : corrige bloquants + mineurs.
  const second = normalizeArticle(
    await ask(ArticleSchema, rewritePrompt(first, [...c1.blocking, ...c1.minor]), {
      system: SYSTEM_PROMPT,
      effort: 'medium',
      maxTokens: 16000,
    }),
    subject
  )
  const c2 = await checkArticle(second, subject, allowed)
  if (c2.blocking.length === 0) return { article: second, issues: [], rewritten: true }

  // La réécriture a introduit un problème alors que la v1 était publiable : on garde la v1.
  if (c1.blocking.length === 0) return { article: first, issues: [], rewritten: false }
  return { article: second, issues: c2.blocking, rewritten: true }
}

// ─── Image : double vérification ──────────────────────────────────────────

interface ChosenImage {
  candidate: UnsplashCandidate
  alt: string
}

function expectedSpecies(subject: Subject): Animal {
  return subject.kind === 'race' ? 'chien' : subject.topic.animal
}

function speciesOk(found: z.infer<typeof IdentifySchema>['species'], expected: Animal): boolean {
  if (expected === 'chien') return found === 'dog'
  if (expected === 'chat') return found === 'cat'
  return found === 'dog' || found === 'cat' || found === 'dog-and-cat'
}

function breedOk(found: string, englishNames: string[]): boolean {
  const f = normalize(found).replace(/[^a-z]/g, '')
  if (!f) return false
  return englishNames.some((n) => {
    const e = normalize(n).replace(/[^a-z]/g, '')
    return f.includes(e) || e.includes(f)
  })
}

function imageBlock(url: string): BetaContentBlockParam {
  return { type: 'image', source: { type: 'url', url } }
}

async function verifyCandidate(
  c: UnsplashCandidate,
  subject: Subject,
  imageSubject: string
): Promise<{ ok: boolean; alt: string; why: string }> {
  const expected = expectedSpecies(subject)
  const judgeQuestion =
    subject.kind === 'race'
      ? `Is the main animal in this photo clearly a purebred ${subject.englishNames[0]}? Be strict: similar-looking breeds, mixes, puppies too young to tell, or a partial/blurry view = isMatch false.`
      : `Is this photo a good, tasteful blog cover for this subject: "${imageSubject}"? It must clearly show ${expected === 'chat' ? 'a cat' : expected === 'chien' ? 'a dog' : 'a dog or a cat'}, with no visible text or watermark and no recognizable human face.`

  const [identity, judge] = await Promise.all([
    ask(
      IdentifySchema,
      [
        imageBlock(c.previewUrl),
        {
          type: 'text',
          text: 'Describe this photo factually. species: main animal(s). breed: the most likely breed of the main animal in English, or "mixed" / "unknown". hasTextOrWatermark: any visible text, logo or watermark. prominentHumanFace: a recognizable human face. isPhotograph: real photo (not illustration/3D).',
        },
      ],
      { effort: 'low', maxTokens: 2000 }
    ),
    ask(
      JudgeSchema,
      [
        imageBlock(c.previewUrl),
        {
          type: 'text',
          text: `${judgeQuestion}\nconfidence: 0 to 1. altFr: short French alt text describing the photo (max 120 chars), without the word "photo".`,
        },
      ],
      { effort: 'low', maxTokens: 2000 }
    ),
  ])

  const why: string[] = []
  if (!speciesOk(identity.species, expected)) why.push(`espèce ${identity.species}`)
  if (subject.kind === 'race' && !breedOk(identity.breed, subject.englishNames))
    why.push(`race identifiée ${identity.breed}`)
  if (identity.hasTextOrWatermark) why.push('texte/filigrane')
  if (identity.prominentHumanFace) why.push('visage humain')
  if (!identity.isPhotograph) why.push('pas une photo')
  if (!judge.isMatch || judge.confidence < IMAGE_MIN_CONFIDENCE)
    why.push(`juge ${judge.isMatch ? 'ok' : 'non'} (${judge.confidence})`)

  return { ok: why.length === 0, alt: stripDashes(judge.altFr).slice(0, 140), why: why.join(', ') }
}

async function chooseImage(
  subject: Subject,
  article: Article
): Promise<{ image: ChosenImage | null; issue?: string }> {
  const query = subject.kind === 'race' ? `${subject.englishNames[0]} dog` : article.imageQuery
  const results = await searchUnsplash(query)
  if (results.length === 0)
    return { image: null, issue: `[image] aucun résultat Unsplash pour « ${query} »` }

  // Priorité aux photos dont la description mentionne déjà la race / l'animal attendu.
  const keywords =
    subject.kind === 'race'
      ? subject.englishNames
      : expectedSpecies(subject) === 'chat'
        ? ['cat', 'kitten']
        : expectedSpecies(subject) === 'chien'
          ? ['dog', 'puppy']
          : ['dog', 'cat']
  const score = (c: UnsplashCandidate) =>
    keywords.some((k) => c.description.toLowerCase().includes(k)) ? 0 : 1
  const ordered = [...results].sort((a, b) => score(a) - score(b)).slice(0, IMAGE_CANDIDATES)

  const verdicts = await Promise.all(
    ordered.map(async (c) => {
      try {
        return await verifyCandidate(c, subject, article.imageSubject)
      } catch (err) {
        return { ok: false, alt: '', why: err instanceof Error ? err.message : 'erreur' }
      }
    })
  )

  const idx = verdicts.findIndex((v) => v.ok)
  if (idx === -1) {
    const detail = verdicts.map((v, i) => `${ordered[i].id}: ${v.why}`).join(' | ')
    return {
      image: null,
      issue: `[image] aucune photo validée par la double vérification (${detail})`,
    }
  }
  return { image: { candidate: ordered[idx], alt: verdicts[idx].alt } }
}

// ─── Portable Text ────────────────────────────────────────────────────────

interface Span {
  _type: 'span'
  _key: string
  text: string
  marks: string[]
}

interface LinkDef {
  _type: 'link'
  _key: string
  href: string
}

interface Block {
  _type: 'block'
  _key: string
  style: 'normal' | 'h2'
  markDefs: LinkDef[]
  children: Span[]
}

function paragraphBlock(text: string): Block {
  const children: Span[] = []
  const markDefs: LinkDef[] = []
  let last = 0
  for (const m of Array.from(text.matchAll(LINK_RE))) {
    const idx = m.index ?? 0
    if (idx > last)
      children.push({ _type: 'span', _key: key(), text: text.slice(last, idx), marks: [] })
    const linkKey = key()
    markDefs.push({ _type: 'link', _key: linkKey, href: m[2] })
    children.push({ _type: 'span', _key: key(), text: m[1], marks: [linkKey] })
    last = idx + m[0].length
  }
  if (last < text.length)
    children.push({ _type: 'span', _key: key(), text: text.slice(last), marks: [] })
  return { _type: 'block', _key: key(), style: 'normal', markDefs, children }
}

function headingBlock(text: string): Block {
  return {
    _type: 'block',
    _key: key(),
    style: 'h2',
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text: plainText(text), marks: [] }],
  }
}

function toBlocks(a: Article, subject: Subject): Block[] {
  const blocks: Block[] = a.intro.map(paragraphBlock)
  a.sections.forEach((s, i) => {
    blocks.push(headingBlock(s.heading), ...s.paragraphs.map(paragraphBlock))
    const isCoat = subject.kind === 'race' && i === a.sections.length - 1
    if (isCoat) {
      blocks.push(
        paragraphBlock(
          `[Notre approche du toilettage du ${subject.label}](/toilettage/${subject.breed.slugRace})`
        )
      )
    }
  })
  return blocks
}

// ─── Slug ─────────────────────────────────────────────────────────────────

function slugify(s: string): string {
  return normalize(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '')
}

async function uniqueSlug(client: SanityClient, base: string): Promise<string> {
  for (let n = 1; n < 20; n++) {
    const slug = n === 1 ? base : `${base}-${n}`
    const taken = await client.fetch<number>(
      `count(*[_type == "post" && (slug.current == $slug || _id in [$id, $draftId])])`,
      { slug, id: `post-${slug}`, draftId: `drafts.post-${slug}` }
    )
    if (taken === 0) return slug
  }
  return `${base}-${key()}`
}

// ─── Run ──────────────────────────────────────────────────────────────────

export interface BlogRunResult {
  status: 'published' | 'draft' | 'skipped'
  dry: boolean
  type: BlogRunType
  subject?: string
  title?: string
  slug?: string
  url?: string
  studioUrl?: string
  excerpt?: string
  wordCount?: number
  rewritten?: boolean
  issues: string[]
  image?: { author: string; authorUrl: string; previewUrl: string; alt: string }
  reason?: string
  article?: Article
}

export async function runBlogPipeline(opts: {
  type: BlogRunType
  dry?: boolean
  race?: string
}): Promise<BlogRunResult> {
  const dry = opts.dry ?? false
  const client = getWriteClient()

  // Sujet : fallback sur l'autre type si la file est vide.
  let subject: Subject | null =
    opts.type === 'race' ? await pickRace(client, opts.race) : await pickTopic(client)
  if (!subject && !opts.race) {
    subject = opts.type === 'race' ? await pickTopic(client) : await pickRace(client)
  }
  if (!subject) {
    return { status: 'skipped', dry, type: opts.type, issues: [], reason: 'Aucun sujet disponible' }
  }

  const links = await loadLinkTargets(client)
  const allowed = new Set(links.map((l) => l.path))
  if (subject.kind === 'race') allowed.add(`/toilettage/${subject.breed.slugRace}`)

  const prompt = subject.kind === 'race' ? racePrompt(subject, links) : topicPrompt(subject, links)
  const draft = normalizeArticle(
    await ask(ArticleSchema, prompt, { system: SYSTEM_PROMPT, effort: 'high', maxTokens: 16000 }),
    subject
  )

  // Relecture (+ réécriture éventuelle) et choix d'image en parallèle : tient dans maxDuration.
  const [written, imageResult] = await Promise.all([
    writeArticle(draft, subject, allowed),
    chooseImage(subject, draft).catch((err: unknown) => ({
      image: null,
      issue: `[image] ${err instanceof Error ? err.message : 'erreur Unsplash'}`,
    })),
  ])

  const { article } = written
  const issues = [...written.issues, ...(imageResult.issue ? [imageResult.issue] : [])]
  const publish = issues.length === 0
  const slug = await uniqueSlug(client, slugify(article.title))
  const postId = `post-${slug}`
  const subjectLabel =
    subject.kind === 'race' ? `Race : ${subject.breed.race}` : `Sujet : ${subject.topic.title}`
  const words = countWords(article)
  const img = imageResult.image

  const result: BlogRunResult = {
    status: publish ? 'published' : 'draft',
    dry,
    type: subject.kind,
    subject: subjectLabel,
    title: article.title,
    slug,
    url: `${SITE}/blog/${slug}`,
    studioUrl: `${SITE}/studio/structure/post;${postId}`,
    excerpt: article.excerpt,
    wordCount: words,
    rewritten: written.rewritten,
    issues,
    image: img
      ? {
          author: img.candidate.authorName,
          authorUrl: img.candidate.authorUrl,
          previewUrl: img.candidate.previewUrl,
          alt: img.alt,
        }
      : undefined,
    article: dry ? article : undefined,
  }
  if (dry) return result

  let coverImage: Record<string, unknown> | undefined
  if (img) {
    const assetId = await uploadUnsplashToSanity(client, img.candidate, slug)
    await trackUnsplashDownload(img.candidate)
    coverImage = {
      _type: 'image',
      asset: { _type: 'reference', _ref: assetId },
      alt: img.alt,
      creditName: img.candidate.authorName,
      creditUrl: img.candidate.authorUrl,
    }
  }

  const category = subject.kind === 'race' ? 'Races' : subject.topic.category
  const animal: Animal = subject.kind === 'race' ? 'chien' : subject.topic.animal

  await client.createOrReplace({
    _id: publish ? postId : `drafts.${postId}`,
    _type: 'post',
    title: article.title,
    slug: { _type: 'slug', current: slug },
    ...(coverImage ? { coverImage } : {}),
    category,
    animal,
    ...(subject.kind === 'race' ? { race: subject.breed.slugRace } : {}),
    excerpt: article.excerpt,
    metaTitle: article.metaTitle,
    metaDescription: article.metaDescription,
    body: toBlocks(article, subject),
    faq: article.faq.map((f) => ({ _type: 'postFaqItem', _key: key(), ...f })),
    publishedAt: new Date().toISOString(),
    readingTime: Math.max(1, Math.ceil(words / 200)),
    aiGenerated: true,
    ...(publish ? {} : { reviewNotes: issues.join('\n') }),
  })

  if (subject.kind === 'topic') {
    await client
      .patch(subject.topic._id)
      .set({
        status: publish ? 'published' : 'draft',
        post: { _type: 'reference', _ref: postId, _weak: true },
      })
      .commit()
  }

  return result
}
