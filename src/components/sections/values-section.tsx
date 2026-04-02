'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, Users, Leaf, Recycle } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'

const VALUES = [
  {
    icon: Heart,
    photo: '/valeurs-1.jpg',
    photoAlt: 'La boutique merci murphy® — rayons et créations florales',
    photoContain: false,
    text: (
      <p className="leading-relaxed text-charcoal/70">
        Un chien est un être sensible et un membre à part entière de votre famille.{' '}
        <span className="text-charcoal font-medium">merci murphy®</span> a à cœur de le considérer
        comme tel et de répondre au mieux à ses besoins physiologiques.
      </p>
    ),
    reverse: false,
  },
  {
    icon: Users,
    photo: '/valeurs-2.jpg',
    photoAlt: "Tote bag merci murphy® — It's never just a dog",
    photoContain: false,
    text: (
      <p className="leading-relaxed text-charcoal/70">
        Dans tout ce qui est entrepris pour la relation entre les chiens et leur famille,{' '}
        <span className="text-charcoal font-medium">merci murphy®</span> recherche un impact
        sociétal positif et significatif — amélioration des conditions de travail, recherche
        d&apos;une juste rémunération, insertion par le travail, soutien de l&apos;entreprenariat
        féminin.
      </p>
    ),
    reverse: true,
  },
  {
    icon: Leaf,
    photo: '/valeurs-3.jpg',
    photoAlt: 'Chiens dans la boutique merci murphy® — un espace de vie partagé',
    photoContain: false,
    text: (
      <p className="leading-relaxed text-charcoal/70">
        <span className="text-charcoal font-medium">merci murphy®</span> est engagé pour réduire son
        impact environnemental — conception éco-responsable de la crèche et de l&apos;atelier de
        toilettage, pratiques quotidiennes visant la réduction de consommation énergétique et
        d&apos;eau, choix du matériel et produits utilisés.
      </p>
    ),
    reverse: false,
  },
  {
    icon: Recycle,
    photo: '/vrac-snacks.jpg',
    photoAlt: 'Distributeurs de snacks en vrac merci murphy®',
    photoContain: false,
    text: (
      <p className="leading-relaxed text-charcoal/70">
        Souhaiter le meilleur pour son chien, c&apos;est aussi consommer différemment.{' '}
        <span className="text-charcoal font-medium">merci murphy®</span> propose une consommation en
        vrac et une offre resserrée de produits éco-responsables et éthiques — et est la première
        boutique pour chien à proposer du{' '}
        <span className="text-charcoal font-medium">second-hand</span>. Réutiliser est la meilleure
        option pour la planète.
      </p>
    ),
    reverse: true,
  },
]

export function ValuesSection() {
  const [active, setActive] = useState(0)
  const value = VALUES[active]
  const Icon = value.icon

  return (
    <div style={{ backgroundColor: '#B5A89A' }}>
      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16 text-charcoal">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Nos valeurs</h2>
              <p className="mt-3 text-charcoal/60">
                Des convictions ancrées et des actions engagées.
              </p>
            </div>
          </Reveal>

          {/* Mobile — carousel */}
          <div className="lg:hidden">
            {/* Dot nav */}
            <div className="flex justify-center gap-2 mb-6">
              {VALUES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active ? 'w-6 bg-terracotta-dark' : 'w-2 bg-charcoal/20'
                  }`}
                  aria-label={`Valeur ${i + 1}`}
                />
              ))}
            </div>

            {/* Card */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
              <Image
                src={'photoMobile' in value && value.photoMobile ? value.photoMobile : value.photo}
                alt={value.photoAlt}
                fill
                className="object-cover object-center"
                sizes="100vw"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-charcoal/10" />
              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Icon className="h-5 w-5 text-terracotta-dark shrink-0" />
                  <div className="h-px flex-1 bg-terracotta-dark/60" />
                </div>
                <div className="text-sm leading-relaxed [&_p]:!text-[#B5A89A] [&_span]:!text-[#B5A89A]">
                  {value.text}
                </div>
              </div>
            </div>

            {/* Swipe hint arrows */}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setActive((a) => (a - 1 + VALUES.length) % VALUES.length)}
                className="text-charcoal/40 hover:text-charcoal transition-colors px-2 py-1"
                aria-label="Précédent"
              >
                ←
              </button>
              <button
                onClick={() => setActive((a) => (a + 1) % VALUES.length)}
                className="text-charcoal/40 hover:text-charcoal transition-colors px-2 py-1"
                aria-label="Suivant"
              >
                →
              </button>
            </div>
          </div>

          {/* Desktop — original stacked layout */}
          <div className="hidden lg:block space-y-20">
            {VALUES.map(({ icon: DIcon, text, reverse, photo, photoAlt, photoContain }, i) => {
              const fit = photoContain ? 'object-contain' : 'object-cover object-center'
              const photoBlock = (
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-charcoal/5 border border-charcoal/10">
                  <Image src={photo} alt={photoAlt} fill className={fit} sizes="50vw" />
                </div>
              )
              const textBlock = (
                <div className="border-l-2 border-terracotta-dark pl-6">
                  <DIcon className="h-6 w-6 text-terracotta-dark mb-4" />
                  {text}
                </div>
              )
              return (
                <Reveal key={i} delay={100}>
                  <div className="grid grid-cols-2 gap-10 items-center">
                    <div className={reverse ? 'order-2' : ''}>{photoBlock}</div>
                    <div className={reverse ? 'order-1' : ''}>{textBlock}</div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
