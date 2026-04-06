// src/sanity/queries/posts.ts
import { sanityClient } from '@/sanity/client'
import type { PortableTextBlock } from '@portabletext/react'

export interface PostSummary {
  _id: string
  title: string
  slug: { current: string }
  coverImage: { asset: { _ref: string }; alt?: string; dominantColor: string | null } | null
  category: string
  excerpt: string
  publishedAt: string
  readingTime: number
}

export interface PostDetail extends PostSummary {
  body: PortableTextBlock[]
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
    `*[_type == "post" && publishedAt <= now()] | order(publishedAt desc) { ${POST_SUMMARY_FIELDS} }`,
    {},
    { next: { revalidate: 3600 } }
  )
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  return sanityClient.fetch(
    `*[_type == "post" && slug.current == $slug && publishedAt <= now()][0] {
      ${POST_SUMMARY_FIELDS},
      body
    }`,
    { slug },
    { next: { revalidate: 3600 } }
  )
}

export async function getRelatedPosts(currentSlug: string): Promise<PostSummary[]> {
  return sanityClient.fetch(
    `*[_type == "post" && slug.current != $currentSlug && publishedAt <= now()] | order(publishedAt desc) [0...3] { ${POST_SUMMARY_FIELDS} }`,
    { currentSlug },
    { next: { revalidate: 3600 } }
  )
}

export async function getLatestPost(): Promise<PostSummary | null> {
  return sanityClient.fetch(
    `*[_type == "post" && publishedAt <= now()] | order(publishedAt desc) [0] { ${POST_SUMMARY_FIELDS} }`,
    {},
    { next: { revalidate: 3600 } }
  )
}

export async function getPublishedPostCount(): Promise<number> {
  return sanityClient.fetch(
    `count(*[_type == "post" && publishedAt <= now()])`,
    {},
    { next: { revalidate: 3600 } }
  )
}
