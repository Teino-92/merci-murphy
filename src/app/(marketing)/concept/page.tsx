import type { Metadata } from 'next'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { TeamMemberCard } from '@/components/sections/team-member-card'
import { getTeamMembers } from '@/sanity/queries/team'
import { urlFor } from '@/sanity/client'
import { Leaf, Heart, Recycle, ShieldCheck, Users } from 'lucide-react'

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
          <Reveal>
            <h1 className="font-display text-4xl font-bold sm:text-5xl">Le concept</h1>
            <p className="mt-6 text-lg leading-relaxed text-cream/70">
              Merci Murphy est née d&apos;une conviction simple : votre chien mérite les meilleurs
              soins, dans un espace chaleureux et bienveillant, au cœur de Paris.
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* Histoire */}
      <Section className="bg-cream">
        <Container className="max-w-3xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <Reveal>
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
                    éducation, ostéopathie et produits premium coexistent sous un même toit, dans
                    une atmosphère à la fois professionnelle et chaleureuse.
                  </p>
                  <p>
                    Aujourd&apos;hui, nous accueillons chaque jour des chiens de tous gabarits et
                    leurs familles, avec la même attention et la même passion qu&apos;au premier
                    jour.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="flex items-center justify-center">
                <div className="flex h-72 w-72 items-center justify-center rounded-full bg-rose/30">
                  <p className="font-display text-2xl font-bold text-charcoal/30">Murphy 🐾</p>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* Valeurs */}
      <Section className="bg-charcoal text-cream">
        <Container className="max-w-4xl">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Nos Valeurs</h2>
              <p className="mt-3 text-cream/60">Des convictions ancrées et des actions engagées.</p>
            </div>
          </Reveal>

          <div className="space-y-20">
            {[
              {
                icon: Heart,
                text: (
                  <p className="leading-relaxed text-cream/80">
                    Un chien est un être sensible et un membre à part entière de votre famille.{' '}
                    <span className="text-cream font-medium">merci murphy®</span> a à cœur de le
                    considérer comme tel et de répondre au mieux à ses besoins physiologiques.
                  </p>
                ),
                reverse: false,
              },
              {
                icon: Users,
                text: (
                  <p className="leading-relaxed text-cream/80">
                    Dans tout ce qui est entrepris pour la relation entre les chiens et leur
                    famille, <span className="text-cream font-medium">merci murphy®</span> recherche
                    un impact sociétal positif et significatif — amélioration des conditions de
                    travail, recherche d&apos;une juste rémunération, insertion par le travail,
                    soutien de l&apos;entreprenariat féminin.
                  </p>
                ),
                reverse: true,
              },
              {
                icon: Leaf,
                text: (
                  <p className="leading-relaxed text-cream/80">
                    <span className="text-cream font-medium">merci murphy®</span> est engagé pour
                    réduire son impact environnemental — conception éco-responsable de la crèche et
                    de l&apos;atelier de toilettage, pratiques quotidiennes visant la réduction de
                    consommation énergétique et d&apos;eau, choix du matériel et produits utilisés.
                  </p>
                ),
                reverse: false,
              },
              {
                icon: Recycle,
                text: (
                  <p className="leading-relaxed text-cream/80">
                    Souhaiter le meilleur pour son chien, c&apos;est aussi consommer différemment.{' '}
                    <span className="text-cream font-medium">merci murphy®</span> propose une
                    consommation en vrac et une offre resserrée de produits éco-responsables et
                    éthiques — et est la première boutique pour chien à proposer du{' '}
                    <span className="text-cream font-medium">second-hand</span>. Réutiliser est la
                    meilleure option pour la planète.
                  </p>
                ),
                reverse: true,
              },
            ].map(({ icon: Icon, text, reverse }, i) => (
              <Reveal key={i} delay={100}>
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
                  <div className={reverse ? 'order-2 lg:order-1' : ''}>
                    {reverse ? (
                      <div className="flex h-64 items-center justify-center rounded-2xl bg-cream/5 border border-cream/10">
                        <p className="text-sm text-cream/20">Photo à venir</p>
                      </div>
                    ) : (
                      <div className="border-l-2 border-terracotta pl-6">
                        <Icon className="h-6 w-6 text-terracotta mb-4" />
                        {text}
                      </div>
                    )}
                  </div>
                  <div className={reverse ? 'order-1 lg:order-2' : ''}>
                    {reverse ? (
                      <div className="border-l-2 border-terracotta pl-6">
                        <Icon className="h-6 w-6 text-terracotta mb-4" />
                        {text}
                      </div>
                    ) : (
                      <div className="flex h-64 items-center justify-center rounded-2xl bg-cream/5 border border-cream/10">
                        <p className="text-sm text-cream/20">Photo à venir</p>
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Engagements */}
      <Section className="bg-rose/20">
        <Container>
          <Reveal>
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
                Nos engagements
              </h2>
            </div>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {ENGAGEMENTS.map((e, i) => (
              <Reveal key={e.title} delay={i * 100}>
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose">
                    <e.icon className="h-6 w-6 text-terracotta" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-charcoal">
                    {e.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/60">{e.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Équipe */}
      {team.length > 0 && (
        <Section className="bg-cream">
          <Container>
            <Reveal>
              <div className="text-center">
                <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
                  Notre équipe
                </h2>
                <p className="mt-4 text-charcoal/60">
                  Des passionnés au service du bien-être de votre chien.
                </p>
              </div>
            </Reveal>
            <div className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member, i) => (
                <Reveal key={member._id} delay={i * 100}>
                  <TeamMemberCard
                    nom={member.nom}
                    role={member.role}
                    bio={member.bio}
                    photoSrc={
                      member.photo ? urlFor(member.photo).width(400).height(400).url() : undefined
                    }
                  />
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  )
}
