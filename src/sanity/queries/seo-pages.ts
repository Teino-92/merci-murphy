import { sanityClient } from '@/sanity/client'
import type { PortableTextBlock } from '@portabletext/react'

export interface SeoPageSummary {
  _id: string
  race: string
  slugRace: string
  title: string
  slug: { current: string }
  metaDescription: string
  typePoil: string | null
  gabarit: string | null
}

export interface SeoPageDetail extends SeoPageSummary {
  metaTitle: string
  intro: PortableTextBlock[]
  approche: PortableTextBlock[]
  frequence: PortableTextBlock[]
  faq: { question: string; reponse: PortableTextBlock[] }[]
  publishedAt: string | null
}

const SEO_SUMMARY_FIELDS = `
  _id,
  race,
  slugRace,
  title,
  slug,
  metaDescription,
  typePoil,
  gabarit
`

const REVALIDATE_OPTS = { next: { revalidate: 3600, tags: ['sanity:seoPage'] } }

export async function getAllPublishedSeoPages(): Promise<SeoPageSummary[]> {
  return sanityClient.fetch(
    `*[_type == "seoPage" && status == "published"] | order(race asc) { ${SEO_SUMMARY_FIELDS} }`,
    {},
    REVALIDATE_OPTS
  )
}

export async function getAllPublishedSeoPagesForSitemap(): Promise<
  { slugRace: string; _updatedAt: string; publishedAt: string | null }[]
> {
  return sanityClient.fetch(
    `*[_type == "seoPage" && status == "published"] | order(publishedAt desc) {
      slugRace, _updatedAt, publishedAt
    }`,
    {},
    REVALIDATE_OPTS
  )
}

export async function getSeoPageBySlugRace(slugRace: string): Promise<SeoPageDetail | null> {
  return sanityClient.fetch(
    `*[_type == "seoPage" && slugRace == $slugRace && status == "published"][0] {
      ${SEO_SUMMARY_FIELDS},
      metaTitle,
      intro,
      approche,
      frequence,
      faq,
      publishedAt
    }`,
    { slugRace },
    REVALIDATE_OPTS
  )
}

/**
 * Maillage interne — 3 pages races similaires (même gabarit ou même type de poil),
 * excluant la page courante.
 */
export async function getRelatedSeoPages(
  currentSlugRace: string,
  gabarit: string | null,
  typePoil: string | null
): Promise<SeoPageSummary[]> {
  return sanityClient.fetch(
    `*[_type == "seoPage" && status == "published"
       && slugRace != $currentSlugRace
       && (gabarit == $gabarit || typePoil == $typePoil)]
       | order(publishedAt desc) [0...3] { ${SEO_SUMMARY_FIELDS} }`,
    { currentSlugRace, gabarit: gabarit ?? '', typePoil: typePoil ?? '' },
    REVALIDATE_OPTS
  )
}

export async function getAllPublishedSeoPagesForLlmsTxt(): Promise<
  { race: string; slugRace: string; metaDescription: string | null }[]
> {
  return sanityClient.fetch(
    `*[_type == "seoPage" && status == "published"] | order(race asc) {
      race, slugRace, metaDescription
    }`,
    {},
    REVALIDATE_OPTS
  )
}
