import { sanityClient } from '@/sanity/client'

export interface Testimonial {
  _id: string
  auteur: string
  note: number
  texte: string
  service: { title: string; slug: { current: string } } | null
  date: string | null
}

export async function getTestimonials(limit = 6): Promise<Testimonial[]> {
  return sanityClient.fetch(
    `*[_type == "testimonial"] | order(date desc) [0...$limit] {
      _id,
      auteur,
      note,
      texte,
      service->{ title, slug },
      date
    }`,
    { limit },
    { next: { revalidate: 3600 } }
  )
}
