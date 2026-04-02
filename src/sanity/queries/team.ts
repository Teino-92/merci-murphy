import { sanityClient } from '@/sanity/client'

export interface TeamMember {
  _id: string
  nom: string
  role: string
  bio: string
  photo: { asset: { _ref: string }; dominantColor: string | null } | null
  ordre: number
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  return sanityClient.fetch(
    `*[_type == "teamMember"] | order(ordre asc) {
      _id,
      nom,
      role,
      bio,
      photo { asset, "dominantColor": asset->metadata.palette.dominant.background },
      ordre
    }`,
    {},
    { next: { revalidate: 3600 } }
  )
}
