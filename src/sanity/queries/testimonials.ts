import { sanityClient } from '@/sanity/client'

export interface Testimonial {
  _id: string
  auteur: string
  note: number
  texte: string
  service: { title: string; slug: { current: string } } | null
  date: string | null
}

export async function getTestimonials(limit = 50): Promise<Testimonial[]> {
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
    { next: { revalidate: 3600, tags: ['sanity:testimonial'] } }
  )
}

export async function getGroomingTestimonials(): Promise<Testimonial[]> {
  const FIELDS = `_id, auteur, note, texte, service->{ title, slug }, date`
  const grooming = await sanityClient.fetch<Testimonial[]>(
    `*[_type == "testimonial" && service->slug.current == "le-toilettage-maison-poilus-r"] | order(date desc) [0...4] { ${FIELDS} }`,
    {},
    { next: { revalidate: 3600, tags: ['sanity:testimonial'] } }
  )
  if (grooming.length >= 4) return grooming

  return sanityClient.fetch<Testimonial[]>(
    `*[_type == "testimonial"] | order(date desc) [0...4] { ${FIELDS} }`,
    {},
    { next: { revalidate: 3600, tags: ['sanity:testimonial'] } }
  )
}
