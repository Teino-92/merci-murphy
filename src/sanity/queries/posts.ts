// src/sanity/queries/posts.ts
import { sanityClient } from '@/sanity/client'
import type { PortableTextBlock } from '@portabletext/react'

export interface PostSummary {
  _id: string
  title: string
  slug: { current: string }
  coverImage: {
    asset: { _ref: string }
    alt?: string
    creditName?: string
    creditUrl?: string
    dominantColor: string | null
  } | null
  category: string
  excerpt: string
  publishedAt: string
  readingTime: number
}

export interface PostFaqItem {
  _key: string
  question: string
  answer: string
}

export interface PostDetail extends PostSummary {
  body: PortableTextBlock[]
  faq: PostFaqItem[] | null
  metaTitle: string | null
  metaDescription: string | null
  race: string | null
  animal: string | null
  _updatedAt: string
}

export interface PostSitemapEntry {
  slug: string
  _updatedAt: string
}

const POST_SUMMARY_FIELDS = `
  _id,
  title,
  slug,
  coverImage { ..., "dominantColor": asset->metadata.palette.dominant.background },
  category,
  excerpt,
  publishedAt,
  readingTime
`

export async function getAllPosts(): Promise<PostSummary[]> {
  return sanityClient.fetch(
    `*[_type == "post" && !(_id in path("drafts.**")) && publishedAt <= now()] | order(publishedAt desc) { ${POST_SUMMARY_FIELDS} }`,
    {},
    { next: { revalidate: 3600, tags: ['sanity:post'] } }
  )
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  return sanityClient.fetch(
    `*[_type == "post" && !(_id in path("drafts.**")) && slug.current == $slug && publishedAt <= now()][0] {
      ${POST_SUMMARY_FIELDS},
      body,
      faq,
      metaTitle,
      metaDescription,
      race,
      animal,
      _updatedAt
    }`,
    { slug },
    { next: { revalidate: 3600, tags: ['sanity:post'] } }
  )
}

// "À lire aussi" : même catégorie (+3, sauf Races pour ne pas aligner que des fiches race),
// même animal (+2, "les-deux" compte pour les deux), puis le plus récent.
export async function getRelatedPosts(
  post: Pick<PostDetail, 'category' | 'animal'> & { slug: string }
): Promise<PostSummary[]> {
  return sanityClient.fetch(
    `*[_type == "post" && !(_id in path("drafts.**")) && slug.current != $slug && publishedAt <= now()] {
      ${POST_SUMMARY_FIELDS},
      "rel": select($category != "Races" && category == $category => 3, 0)
        + select(defined($animal) && (animal == $animal || animal == "les-deux" || $animal == "les-deux") => 2, 0)
    } | order(rel desc, publishedAt desc) [0...3]`,
    { slug: post.slug, category: post.category ?? null, animal: post.animal ?? null },
    { next: { revalidate: 3600, tags: ['sanity:post'] } }
  )
}

export async function getLatestPost(): Promise<PostSummary | null> {
  return sanityClient.fetch(
    `*[_type == "post" && !(_id in path("drafts.**")) && publishedAt <= now()] | order(publishedAt desc) [0] { ${POST_SUMMARY_FIELDS} }`,
    {},
    { next: { revalidate: 3600, tags: ['sanity:post'] } }
  )
}

export async function getPublishedPostCount(): Promise<number> {
  return sanityClient.fetch(
    `count(*[_type == "post" && !(_id in path("drafts.**")) && publishedAt <= now()])`,
    {},
    { next: { revalidate: 3600, tags: ['sanity:post'] } }
  )
}

export async function getAllPostsForSitemap(): Promise<PostSitemapEntry[]> {
  return sanityClient.fetch(
    `*[_type == "post" && !(_id in path("drafts.**")) && publishedAt <= now()] | order(publishedAt desc) { "slug": slug.current, _updatedAt }`,
    {},
    { next: { revalidate: 3600, tags: ['sanity:post'] } }
  )
}
