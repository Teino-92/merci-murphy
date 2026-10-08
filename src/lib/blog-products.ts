// src/lib/blog-products.ts
// Sélection éco-shop sous chaque article de blog : produits liés à l'animal et au thème
// de l'article (via les tags Shopify), au lieu d'un tirage au hasard.

import type { ShopifyProduct } from '@/lib/shopify'

interface BlogProductContext {
  title: string
  category: string
  animal: string | null
  race: string | null
}

// Tags Shopify d'usage → mots-clés qui, dans le titre de l'article, rendent ce tag pertinent.
const THEME_KEYWORDS: { tags: string[]; keywords: RegExp }[] = [
  {
    tags: ['bichonner', 'produit de soin', 'shampoing'],
    keywords: /toilett|pelage|poil|bross|bain|shampo|soin|mue|propre|odeur|beaut/,
  },
  {
    tags: ['sortir', 'accessoire'],
    keywords: /balade|promen|sortir|sortie|parc|bois|quai|vacance|voyage|transport|metro/,
  },
  { tags: ['jouer'], keywords: /jeu|jouer|jouet|occuper|ennui|stimul|educ|apprent/ },
  { tags: ['régaler'], keywords: /friandise|gourmand|recompens|cadeau|noel|anniversaire/ },
]

const CATEGORY_TAGS: Record<string, string[]> = {
  'Bien-être': ['bichonner', 'produit de soin', 'shampoing'],
  'Vie à Paris': ['sortir', 'accessoire'],
  Éducation: ['jouer', 'régaler'],
  // Article race : section pelage + vie parisienne
  Races: ['bichonner', 'produit de soin', 'shampoing', 'sortir'],
}

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function wantedAnimals(ctx: BlogProductContext): string[] {
  if (ctx.animal === 'chien' || ctx.race) return ['chien']
  if (ctx.animal === 'chat') return ['chat']
  return ['chien', 'chat']
}

function wantedThemes(ctx: BlogProductContext): Set<string> {
  const title = normalize(ctx.title)
  const tags = new Set(CATEGORY_TAGS[ctx.category] ?? [])
  for (const theme of THEME_KEYWORDS) {
    if (theme.keywords.test(title)) theme.tags.forEach((t) => tags.add(t))
  }
  return tags
}

export function pickBlogProducts(
  products: ShopifyProduct[],
  ctx: BlogProductContext,
  count = 6
): ShopifyProduct[] {
  const animals = wantedAnimals(ctx)
  const themes = wantedThemes(ctx)

  const scored = products
    .filter((p) => p.availableForSale)
    .map((p) => {
      const tags = p.tags.map((t) => t.toLowerCase())
      const otherAnimalOnly =
        !animals.some((a) => tags.includes(a)) && (tags.includes('chien') || tags.includes('chat'))
      let score = 0
      if (animals.some((a) => tags.includes(a))) score += 3
      if (tags.some((t) => themes.has(t))) score += 4
      // Petshop = produits pour l'animal, plus utiles au lecteur que les goodies Petlovers
      if (p.productType === 'Petshop') score += 2
      // Random tie-break : la sélection tourne à chaque régénération ISR
      return { p, score, otherAnimalOnly, tie: Math.random() }
    })
    .filter((s) => !s.otherAnimalOnly)

  scored.sort((a, b) => b.score - a.score || a.tie - b.tie)

  // Une seule déclinaison par gamme (ex. les cabas "Le Murphy week-end" en 5 couleurs)
  const seen = new Set<string>()
  const picked: ShopifyProduct[] = []
  for (const { p } of scored) {
    const family = normalize(p.title.split(/,| - /)[0]).trim()
    if (seen.has(family)) continue
    seen.add(family)
    picked.push(p)
    if (picked.length === count) break
  }
  return picked
}
