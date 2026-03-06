import { sanityClient } from '@/sanity/client'

export interface HoraireLigne {
  jour: string
  heures: string
}

export interface HoraireGroupe {
  titre: string
  lignes: HoraireLigne[]
}

export interface SiteSettings {
  adresse: string
  ville: string
  codePostal: string
  telephone: string
  email: string
  horairesGroupes: HoraireGroupe[]
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
      horairesGroupes[] {
        titre,
        lignes[] { jour, heures }
      },
      instagram,
      google_maps_url,
      calendly_url
    }`
  )
}
