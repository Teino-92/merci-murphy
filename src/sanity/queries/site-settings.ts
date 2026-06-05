import { sanityClient } from '@/sanity/client'

export interface HoraireLigne {
  jour: string
  heures: string
}

export interface HoraireGroupe {
  titre: string
  lignes: HoraireLigne[]
}

export interface PromoBanner {
  active: boolean
  startDate: string | null
  endDate: string | null
  message: string | null
  ctaLabel: string | null
  ctaHref: string | null
  productTag: string | null
  badgeLabel: string | null
  discountPercent: number | null
  theme: 'terracotta' | 'charcoal' | 'rose' | null
}

/**
 * True if the promo is active AND within its optional date window.
 * Used by banner + product badges/prices so everything turns off in sync.
 */
export function isPromoLive(banner: PromoBanner | null, now: Date = new Date()): boolean {
  if (!banner?.active) return false
  if (banner.startDate && now < new Date(banner.startDate)) return false
  if (banner.endDate && now > new Date(banner.endDate)) return false
  return true
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
  promoBanner: PromoBanner | null
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
      calendly_url,
      promoBanner {
        active,
        startDate,
        endDate,
        message,
        ctaLabel,
        ctaHref,
        productTag,
        badgeLabel,
        discountPercent,
        theme
      }
    }`,
    {},
    { next: { revalidate: 60, tags: ['sanity:site-settings'] } }
  )
}
