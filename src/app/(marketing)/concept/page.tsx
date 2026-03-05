import type { Metadata } from 'next'
import { Section, Container } from '@/components/ui/section'
import { TeamMemberCard } from '@/components/sections/team-member-card'
import { getTeamMembers } from '@/sanity/queries/team'
import { urlFor } from '@/sanity/client'
import { Leaf, Heart, Recycle, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Le concept',
  description:
    "Découvrez l'histoire de Merci Murphy, notre équipe et nos engagements pour le bien-être animal à Paris.",
}

const ENGAGEMENTS = [
  {
    icon: Heart,
    title: 'Bien-être animal',
    description:
      'Chaque soin est pensé pour respecter le rythme et le confort de votre chien. Pas de stress, pas de précipitation.',
  },
  {
    icon: Leaf,
    title: 'Produits naturels',
    description:
      'Nous sélectionnons des produits doux, naturels et adaptés à chaque type de pelage et de peau.',
  },
  {
    icon: Recycle,
    title: 'Écoresponsable',
    description:
      "Emballages recyclés, produits écoresponsables, consommation d'eau raisonnée — nous agissons à notre échelle.",
  },
  {
    icon: ShieldCheck,
    title: 'Expertise certifiée',
    description:
      'Notre équipe est formée aux meilleures techniques de toilettage, éducation positive et ostéopathie animale.',
  },
]

export default async function ConceptPage() {
  const team = await getTeamMembers()

  return (
    <>
      {/* Hero */}
      <Section className="bg-charcoal text-cream py-24">
        <Container className="max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Le concept</h1>
          <p className="mt-6 text-lg leading-relaxed text-cream/70">
            Merci Murphy est née d&apos;une conviction simple : votre chien mérite les meilleurs
            soins, dans un espace chaleureux et bienveillant, au cœur de Paris.
          </p>
        </Container>
      </Section>

      {/* Histoire */}
      <Section className="bg-cream">
        <Container className="max-w-3xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-charcoal">Notre histoire</h2>
              <div className="mt-6 space-y-4 text-charcoal/70 leading-relaxed">
                <p>
                  Tout a commencé avec Murphy — notre chien, notre mascotte, et l&apos;inspiration
                  derrière tout ce que nous faisons. En cherchant des soins de qualité pour lui à
                  Paris, nous avons réalisé qu&apos;il manquait un espace vraiment dédié au
                  bien-être global des chiens.
                </p>
                <p>
                  Merci Murphy est né de cette idée : créer une boutique-concept où toilettage,
                  éducation, ostéopathie et produits premium coexistent sous un même toit, dans une
                  atmosphère à la fois professionnelle et chaleureuse.
                </p>
                <p>
                  Aujourd&apos;hui, nous accueillons chaque jour des chiens de tous gabarits et
                  leurs familles, avec la même attention et la même passion qu&apos;au premier jour.
                </p>
              </div>
            </div>
            {/* Murphy placeholder */}
            <div className="flex items-center justify-center">
              <div className="flex h-72 w-72 items-center justify-center rounded-full bg-rose/30">
                <p className="font-display text-2xl font-bold text-charcoal/30">Murphy 🐾</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Engagements */}
      <Section className="bg-rose/20">
        <Container>
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
              Nos engagements
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {ENGAGEMENTS.map((e) => (
              <div key={e.title} className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose">
                  <e.icon className="h-6 w-6 text-terracotta" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-charcoal">{e.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/60">{e.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Équipe */}
      {team.length > 0 && (
        <Section className="bg-cream">
          <Container>
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
                Notre équipe
              </h2>
              <p className="mt-4 text-charcoal/60">
                Des passionnés au service du bien-être de votre chien.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <TeamMemberCard
                  key={member._id}
                  nom={member.nom}
                  role={member.role}
                  bio={member.bio}
                  photoSrc={
                    member.photo ? urlFor(member.photo).width(400).height(400).url() : undefined
                  }
                />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  )
}
