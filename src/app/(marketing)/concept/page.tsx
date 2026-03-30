export const revalidate = 3600

import type { Metadata } from 'next'
import Image from 'next/image'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { Values } from '@/components/sections/values'
import { ValuesSection } from '@/components/sections/values-section'
import { TeamMemberCard } from '@/components/sections/team-member-card'
import { getTeamMembers } from '@/sanity/queries/team'
import { urlFor } from '@/sanity/client'

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
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-charcoal/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/20 to-transparent" />
        {/* Text — bottom-left */}
        <div className="absolute bottom-0 left-0 px-8 pb-10 sm:px-14 sm:pb-14 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta-dark mb-3">
            Paris, France
          </p>
          <h1 className="font-display text-4xl font-bold text-cream sm:text-6xl leading-tight drop-shadow-sm">
            merci murphy®
          </h1>
          <p className="mt-4 text-base leading-relaxed text-cream/80 sm:text-lg max-w-md drop-shadow-sm">
            ambassadeur d&apos;un art de vivre partagé entre l&apos;humain et son animal.
          </p>
        </div>
      </div>

      {/* Histoire */}
      <Section className="bg-cream">
        <Container className="max-w-3xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-terracotta-dark mb-3">
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

      <ValuesSection />

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
            <div className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-3 lg:gap-12">
              {team.map((member, i) => (
                <Reveal key={member._id} delay={i * 100}>
                  <TeamMemberCard
                    nom={member.nom}
                    role={member.role}
                    bio={member.bio}
                    photoSrc={
                      member.photo
                        ? urlFor(member.photo)
                            .width(400)
                            .height(400)
                            .auto('format')
                            .quality(80)
                            .url()
                        : undefined
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
