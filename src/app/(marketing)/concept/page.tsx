import type { Metadata } from 'next'
import type React from 'react'
import Image from 'next/image'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { Values } from '@/components/sections/values'
import { TeamMemberCard } from '@/components/sections/team-member-card'
import { getTeamMembers } from '@/sanity/queries/team'
import { urlFor } from '@/sanity/client'
import { Leaf, Heart, Recycle, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Le concept',
  description:
    "Découvrez l'histoire de merci murphy®, notre équipe et nos engagements pour le bien-être animal à Paris.",
}

export default async function ConceptPage() {
  const team = await getTeamMembers()

  return (
    <>
      {/* Hero — full-width landscape photo, text overlay bottom-left */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] overflow-hidden">
        <Image
          src="/concept-hero.jpg"
          alt="L'intérieur de la boutique merci murphy®"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Gradient: strong at bottom-left, fades out */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/40 to-transparent" />
        {/* Text — bottom-left */}
        <div className="absolute bottom-0 left-0 px-8 pb-10 sm:px-14 sm:pb-14 max-w-2xl">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-terracotta mb-3">
              Paris, France
            </p>
            <h1 className="font-display text-4xl font-bold text-cream sm:text-6xl leading-tight drop-shadow-sm">
              merci murphy®
            </h1>
            <p className="mt-4 text-base leading-relaxed text-cream/80 sm:text-lg max-w-md drop-shadow-sm">
              ambassadeur d&apos;un art de vivre partagé entre l&apos;humain et son animal.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Histoire */}
      <Section className="bg-cream">
        <Container className="max-w-3xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-terracotta mb-3">
                  Le concept
                </p>
                <h2 className="font-display text-3xl font-bold text-charcoal">
                  Vivre heureux avec son chien et son chat à Paris
                </h2>
                <div className="mt-6 space-y-4 text-charcoal/70 leading-relaxed">
                  <p>
                    <span className="text-charcoal font-medium">merci murphy®</span> c&apos;est un
                    lieu unique, chaleureux et bienveillant au cœur de Paris où l&apos;on peut
                    confier son compagnon ou simplement échanger avec un expert ou entre
                    &laquo;&nbsp;pet-parents&nbsp;&raquo;.
                  </p>
                  <p>
                    <span className="text-charcoal font-medium">merci murphy®</span> c&apos;est un
                    collectif engagé d&apos;experts et de passionnés pour répondre aux besoins de
                    votre compagnon urbain et vous facilite la vie.
                  </p>
                  <p>
                    <span className="text-charcoal font-medium">merci murphy®</span> c&apos;est le
                    spot pour se retrouver entre copains chiens, entre
                    &laquo;&nbsp;parents&nbsp;&raquo; de chiens, entre ceux qui aiment les chiens.
                    Le temps d&apos;une journée à la crèche canine, pour un toilettage, pour un
                    moment détente au spa maison POILUS pour profiter d&apos;un massage, d&apos;un
                    bain, d&apos;une balnéo, ou même juste pour un conseil d&apos;éducation.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="flex items-center justify-center">
                <div className="relative h-80 w-80 overflow-hidden rounded-full shadow-md ring-4 ring-rose/40">
                  <Image
                    src="/murphy-2.jpg"
                    alt="Murphy, le carlin mascotte de merci murphy®"
                    fill
                    className="object-cover object-[center_20%]"
                    sizes="160px"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* Valeurs */}
      <div style={{ backgroundColor: '#B5A89A' }}>
        <Section className="text-charcoal">
          <Container className="max-w-4xl">
            <Reveal>
              <div className="text-center mb-16">
                <h2 className="font-display text-3xl font-bold sm:text-4xl">Nos valeurs</h2>
                <p className="mt-3 text-charcoal/60">
                  Des convictions ancrées et des actions engagées.
                </p>
              </div>
            </Reveal>

            <div className="space-y-20">
              {[
                {
                  icon: Heart,
                  photo: '/valeurs-1.jpg',
                  photoAlt: 'La crèche merci murphy® — du lien, de la joie',
                  photoAspect: 'aspect-[4/3]',
                  photoPosition: 'object-[center_20%]',
                  photoFilter: 'saturate-[0.85] brightness-[1.05] hue-rotate-[-10deg]',
                  text: (
                    <p className="leading-relaxed text-charcoal/70">
                      Un chien est un être sensible et un membre à part entière de votre famille.{' '}
                      <span className="text-charcoal font-medium">merci murphy®</span> a à cœur de
                      le considérer comme tel et de répondre au mieux à ses besoins physiologiques.
                    </p>
                  ),
                  reverse: false,
                },
                {
                  icon: Users,
                  photo: '/valeurs-2.jpg',
                  photoAlt: 'La crèche merci murphy® — un espace pensé pour les chiens',
                  photoAspect: 'aspect-[4/3]',
                  text: (
                    <p className="leading-relaxed text-charcoal/70">
                      Dans tout ce qui est entrepris pour la relation entre les chiens et leur
                      famille, <span className="text-charcoal font-medium">merci murphy®</span>{' '}
                      recherche un impact sociétal positif et significatif — amélioration des
                      conditions de travail, recherche d&apos;une juste rémunération, insertion par
                      le travail, soutien de l&apos;entreprenariat féminin.
                    </p>
                  ),
                  reverse: true,
                },
                {
                  icon: Leaf,
                  photo: '/valeurs-3.jpg',
                  photoAlt: 'Produits naturels merci murphy® — shampoings et bougies',
                  text: (
                    <p className="leading-relaxed text-charcoal/70">
                      <span className="text-charcoal font-medium">merci murphy®</span> est engagé
                      pour réduire son impact environnemental — conception éco-responsable de la
                      crèche et de l&apos;atelier de toilettage, pratiques quotidiennes visant la
                      réduction de consommation énergétique et d&apos;eau, choix du matériel et
                      produits utilisés.
                    </p>
                  ),
                  reverse: false,
                },
                {
                  icon: Recycle,
                  photo: '/valeurs-4.jpg',
                  photoAlt: "L'ecoshop merci murphy® — consommer autrement",
                  photoAspect: 'aspect-[4/3]',
                  photoContain: true,
                  text: (
                    <p className="leading-relaxed text-charcoal/70">
                      Souhaiter le meilleur pour son chien, c&apos;est aussi consommer différemment.{' '}
                      <span className="text-charcoal font-medium">merci murphy®</span> propose une
                      consommation en vrac et une offre resserrée de produits éco-responsables et
                      éthiques — et est la première boutique pour chien à proposer du{' '}
                      <span className="text-charcoal font-medium">second-hand</span>. Réutiliser est
                      la meilleure option pour la planète.
                    </p>
                  ),
                  reverse: true,
                },
              ].map(
                (
                  {
                    icon: Icon,
                    text,
                    reverse,
                    photo,
                    photoAlt,
                    photoAspect,
                    photoPosition,
                    photoContain,
                    photoFilter,
                  }: {
                    icon: React.ElementType
                    text: React.ReactNode
                    reverse: boolean
                    photo?: string
                    photoAlt?: string
                    photoAspect?: string
                    photoPosition?: string
                    photoContain?: boolean
                    photoFilter?: string
                  },
                  i
                ) => {
                  const aspect = photoAspect ?? 'aspect-[4/3]'
                  const pos = photoPosition ?? 'object-center'
                  const fit = photoContain ? 'object-contain' : `object-cover ${pos}`
                  const photoBlock = photo ? (
                    <div
                      className={`relative w-full ${aspect} overflow-hidden rounded-2xl bg-charcoal/5 border border-charcoal/10`}
                    >
                      <Image
                        src={photo}
                        alt={photoAlt ?? ''}
                        fill
                        className={`${fit} ${photoFilter ?? ''}`}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ) : (
                    <div className="flex h-64 items-center justify-center rounded-2xl bg-cream/5 border border-cream/10">
                      <p className="text-sm text-charcoal/30">Photo à venir</p>
                    </div>
                  )
                  const textBlock = (
                    <div className="border-l-2 border-terracotta-dark pl-6">
                      <Icon className="h-6 w-6 text-terracotta-dark mb-4" />
                      {text}
                    </div>
                  )
                  return (
                    <Reveal key={i} delay={100}>
                      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
                        <div className={reverse ? 'lg:order-2' : ''}>{photoBlock}</div>
                        <div className={reverse ? 'lg:order-1' : ''}>{textBlock}</div>
                      </div>
                    </Reveal>
                  )
                }
              )}
            </div>
          </Container>
        </Section>
      </div>

      <Values />

      {/* Équipe */}
      {team.length > 0 && (
        <Section className="bg-cream">
          <Container>
            <Reveal>
              <div className="text-center">
                <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">WIP</h2>
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
