import Image from 'next/image'

import { CONTAINER, DisplayTitle, SUB_LINE, SUB_TONE } from '@/components/ui/editorial'
import { cn, BLUR_PLACEHOLDER } from '@/lib/utils'
import { noOrphan } from '@/lib/typo'

const VALUES = [
  {
    title: 'Bien-être animal',
    description:
      'Chaque service, chaque soin est pensé pour le confort de votre animal, dans le respect de ses besoins physiologiques et de son tempérament.',
  },
  {
    title: 'Écoresponsabilité',
    description:
      "Produits naturels, matières biologiques et recyclées, production artisanale française et européenne. Consommation d'eau raisonnée.",
  },
  {
    // Casse reprise de la prod : le texte du h3 ne change pas.
    title: 'Expertise & Bienveillance',
    description:
      'Une équipe passionnée et engagée, un collectif d’experts avec une approche bienveillante et positive.',
  },
]

const DEFAULT_IMAGE = {
  src: '/valeurs-2.jpg',
  alt: "Dans la boutique, un carlin noir porté sur l'épaule au-dessus d'un cabas merci murphy® « It's never just a dog. »",
}

interface ValuesV2Props {
  /** Remplace la photo quand la page en affiche déjà une partie (concept). */
  image?: { src: string; alt: string; position?: string }
  /** Couleur de la bande haute, à accorder avec la section précédente. */
  className?: string
}

/**
 *Engagements v2.
 * L'aplat rose du hero revient en pleine largeur ; la photo de la boutique le
 * chevauche par le haut, en miroir de la devanture. Pas d'icônes : trois
 * engagements séparés par des filets. La ligne italique reste hors du h2,
 * comme en prod.
 */
export function ValuesV2({ image = DEFAULT_IMAGE, className }: ValuesV2Props) {
  return (
    <section className={cn('bg-cream pt-12 lg:pt-20', className)}>
      <div className="bg-rose">
        <div className={cn(CONTAINER, 'pb-16 lg:pb-24')}>
          <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end lg:gap-x-20">
            <div className="relative -mt-12 aspect-square w-[72%] overflow-hidden sm:w-1/2 lg:-mt-20 lg:w-full">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
                className="object-cover"
                style={image.position ? { objectPosition: image.position } : undefined}
                sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 72vw"
              />
            </div>

            <div className="lg:pb-2">
              <DisplayTitle size="feature">Nos engagements</DisplayTitle>
              <p className={cn(SUB_LINE, SUB_TONE.light, 'mt-4 lg:mt-6')}>
                pour des chiens et des chats bien dans leurs pattes
              </p>
            </div>
          </div>

          <ul className="mt-14 grid grid-cols-1 border-t border-charcoal/20 lg:mt-20 lg:grid-cols-3">
            {VALUES.map((value) => (
              <li
                key={value.title}
                className="border-b border-charcoal/20 py-7 lg:border-b-0 lg:border-l lg:px-8 lg:py-9 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
              >
                <h3 className="font-display text-2xl leading-tight text-charcoal lg:text-[1.75rem]">
                  {noOrphan(value.title)}
                </h3>
                <p className="mt-3 max-w-sm text-base leading-relaxed text-charcoal/80">
                  {noOrphan(value.description)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
