/**
 * Renomme les slugs Sanity des services "maison-poilus-r" vers des slugs
 * orientés service. Les 301 correspondantes sont dans next.config.mjs.
 *
 * Usage : npx tsx --env-file=.env.local scripts/seo/08-rename-service-slugs.ts [--apply]
 * Sans --apply : dry-run (liste les documents concernés).
 */

import { getWriteClient } from './lib/sanity-write'

const SLUG_MAP: Record<string, string> = {
  'le-toilettage-maison-poilus-r': 'toilettage',
  'le-spa-maison-poilus-r': 'spa-chien',
  'balneo-maison-poilus-r': 'balneo-chien',
  'le-bain-en-libre-service-maison-poilus-r': 'bain-libre-service',
  'le-massage-bien-etre-maison-poilus-r-and-le-petit-nenuphar': 'massage-chien',
}

async function main() {
  const apply = process.argv.includes('--apply')
  const client = getWriteClient()
  const docs = await client.fetch<{ _id: string; slug: string }[]>(
    `*[_type == "service" && slug.current in $slugs]{ _id, "slug": slug.current }`,
    { slugs: Object.keys(SLUG_MAP) }
  )

  for (const doc of docs) {
    const next = SLUG_MAP[doc.slug]
    process.stdout.write(`${doc._id}: ${doc.slug} -> ${next}\n`)
    if (apply) await client.patch(doc._id).set({ 'slug.current': next }).commit()
  }
  process.stdout.write(apply ? `${docs.length} renommés\n` : `dry-run (${docs.length})\n`)
}

main().catch((err) => {
  process.stderr.write(`${String(err)}\n`)
  process.exit(1)
})
