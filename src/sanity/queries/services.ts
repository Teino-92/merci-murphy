import { sanityClient } from '@/sanity/client'
import type { PortableTextBlock } from '@portabletext/react'

export interface ServiceSummary {
  _id: string
  title: string
  slug: { current: string }
  description: string
  image: { asset: { _ref: string } } | null
}

export interface ServiceDetail extends ServiceSummary {
  approche: PortableTextBlock[]
  deroule: PortableTextBlock[] | null
  tarifs: { label: string; prix: string; disclaimer: string }[]
  faq: { question: string; reponse: PortableTextBlock[] }[]
  cta: { label: string; type: 'reservation' | 'telephone' } | null
}

const SERVICE_SUMMARY_FIELDS = `
  _id,
  title,
  slug,
  description,
  image
`

export async function getAllServices(): Promise<ServiceSummary[]> {
  return sanityClient.fetch(
    `*[_type == "service"] | order(_createdAt asc) { ${SERVICE_SUMMARY_FIELDS} }`
  )
}

export async function getServiceBySlug(slug: string): Promise<ServiceDetail | null> {
  return sanityClient.fetch(
    `*[_type == "service" && slug.current == $slug][0] {
      ${SERVICE_SUMMARY_FIELDS},
      approche,
      deroule,
      tarifs,
      faq,
      cta
    }`,
    { slug }
  )
}
