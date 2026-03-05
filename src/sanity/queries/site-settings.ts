import { sanityClient } from '@/sanity/client'

export interface SiteSettings {
  adresse: string
  ville: string
  codePostal: string
  telephone: string
  email: string
  horaires: { jour: string; heures: string }[]
  instagram: string
  google_maps_url: string
  calendly_url: string
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return sanityClient.fetch(
    `*[_type == "siteSettings"][0] {
      adresse,
      ville,
      codePostal,
      telephone,
      email,
      horaires,
      instagram,
      google_maps_url,
      calendly_url
    }`
  )
}
