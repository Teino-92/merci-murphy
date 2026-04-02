import { sanityClient } from '@/sanity/client'
import type { PortableTextBlock } from '@portabletext/react'

export interface ServiceSummary {
  _id: string
  title: string
  slug: { current: string }
  description: string
  image: { asset: { _ref: string }; dominantColor: string | null } | null
}

export interface TarifsToilettage {
  note?: string
  surDevis?: string
  gabarits?: {
    label: string
    lignes: {
      type?: string
      bain?: string
      bainCoupe?: string
      bainEpilation?: string
    }[]
  }[]
  supplements?: { label: string; prix: string }[]
}

export interface ServiceDetail extends ServiceSummary {
  approche: PortableTextBlock[]
  deroule: PortableTextBlock[] | null
  tarifs: { label: string; prix: string; disclaimer: string }[]
  tarifsToilettage: TarifsToilettage | null
  faq: { question: string; reponse: PortableTextBlock[] }[]
  cta: { label: string; type: 'reservation' | 'telephone' } | null
  calendlyUrl: string | null
}

const SERVICE_SUMMARY_FIELDS = `
  _id,
  title,
  slug,
  description,
  image { asset, "dominantColor": asset->metadata.palette.dominant.background }
`

export async function getAllServices(): Promise<ServiceSummary[]> {
  return sanityClient.fetch(
    `*[_type == "service"] | order(ordre asc, _createdAt asc) { ${SERVICE_SUMMARY_FIELDS} }`,
    {},
    { next: { revalidate: 3600 } }
  )
}

export async function getServiceBySlug(slug: string): Promise<ServiceDetail | null> {
  return sanityClient.fetch(
    `*[_type == "service" && slug.current == $slug][0] {
      ${SERVICE_SUMMARY_FIELDS},
      approche,
      deroule,
      tarifs,
      tarifsToilettage,
      faq,
      cta,
      calendlyUrl
    }`,
    { slug },
    { next: { revalidate: 3600 } }
  )
}
