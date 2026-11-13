import Image from 'next/image'
import type { ReactNode } from 'react'

import { CONTAINER, DisplayTitle, SUB_LINE, SUB_TONE } from '@/components/ui/editorial'
import { cn, BLUR_PLACEHOLDER } from '@/lib/utils'
import { noOrphan } from '@/lib/typo'

const BRAND = <span className="font-medium text-charcoal">merci murphy®</span>

// Textes et photos repris de ValuesSection (prod) ; seule la mise en page change.
const VALUES: { photo: string; alt: string; position?: string; text: ReactNode }[] = [
  {
    photo: '/valeurs-1.jpg',
    alt: 'La boutique merci murphy® — rayons et créations florales',
    position: 'center 60%',
    text: (
      <>
        Un chien est un être sensible et un membre à part entière de votre famille. {BRAND} a à cœur
        de le considérer comme tel et de répondre au mieux à ses besoins physiologiques.
      </>
    ),
  },
  {
    photo: '/valeurs-2.jpg',
    alt: "Tote bag merci murphy® — It's never just a dog",
    position: 'center 3%',
    text: (
      <>
        Dans tout ce qui est entrepris pour la relation entre les chiens et leur famille, {BRAND}{' '}
        recherche un impact sociétal positif et significatif — amélioration des conditions de
        travail, recherche d&apos;une juste rémunération, insertion par le travail, soutien de
        l&apos;entreprenariat féminin.
      </>
    ),
  },
  {
    photo: '/valeurs-3.jpg',
    alt: 'Chiens dans la boutique merci murphy® — un espace de vie partagé',
    position: 'center 30%',
    text: (
      <>
        {BRAND} est engagé pour réduire son impact environnemental — conception éco-responsable de
        la crèche et de l&apos;atelier de toilettage, pratiques quotidiennes visant la réduction de
        consommation énergétique et d&apos;eau, choix du matériel et produits utilisés.
      </>
    ),
  },
  {
    photo: '/vrac-snacks.jpg',
    alt: 'Distributeurs de snacks en vrac merci murphy®',
    text: (
      <>
        Souhaiter le meilleur pour son chien, c&apos;est aussi consommer différemment. {BRAND}{' '}
        propose une consommation en vrac et une offre resserrée de produits éco-responsables et
        éthiques — et est la première boutique pour chien à proposer du{' '}
        <span className="font-medium text-charcoal">second-hand</span>. Réutiliser est la meilleure
        option pour la planète.
      </>
    ),
  },
]

/**
 *Nos valeurs (page concept).
 * Remplace le carrousel mobile et les cartes arrondies de ValuesSection par
 * une seule mise en page : photo et texte alternés, séparés par des filets,
 * sur le taupe déjà utilisé en prod pour cette section.
 */
export function ConceptValuesV2() {
  return (
    <section id="valeurs" className="scroll-mt-24 bg-[#B5A89A] pb-4 pt-16 lg:pb-8 lg:pt-24">
      <div className={CONTAINER}>
        <DisplayTitle surface="taupe">Nos valeurs</DisplayTitle>
        <p className={cn(SUB_LINE, SUB_TONE.taupe, 'mt-4 lg:mt-6')}>
          Des convictions ancrées et des actions engagées.
        </p>

        <ul className="mt-12 border-b border-charcoal/20 lg:mt-16">
          {VALUES.map((value, i) => (
            <li
              key={value.photo}
              className="grid grid-cols-1 gap-y-6 border-t border-charcoal/20 py-8 sm:grid-cols-2 sm:items-center sm:gap-x-10 lg:gap-x-20 lg:py-12"
            >
              <div
                className={cn(
                  'relative aspect-[4/3] overflow-hidden bg-charcoal/5',
                  i % 2 === 1 && 'sm:order-2'
                )}
              >
                <Image
                  src={value.photo}
                  alt={value.alt}
                  fill
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                  className="object-cover"
                  style={value.position ? { objectPosition: value.position } : undefined}
                  sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <p className="max-w-lg text-base leading-relaxed text-charcoal/80 lg:text-lg">
                {noOrphan(value.text)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
