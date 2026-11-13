import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { CONTAINER, TEXT_LINK } from '@/components/ui/editorial'
import { SITE_CONFIG } from '@/config/site'
import { cn, BLUR_PLACEHOLDER } from '@/lib/utils'
import { noOrphan } from '@/lib/typo'

interface HeroV2Props {
  subtitle: string
  className?: string
}

const PHONE_HREF = `tel:${SITE_CONFIG.phone.replace(/\s/g, '')}`

/**
 * Hero « La vitrine ».
 * Collage éditorial : titre à deux niveaux à gauche, devanture à cheval sur un
 * aplat rose à droite, médaillon de Murphy. Une seule séquence de motion au
 * chargement (classes hero-* dans globals.css), neutralisée sous
 * prefers-reduced-motion.
 */
export function HeroV2({ subtitle, className }: HeroV2Props) {
  return (
    <section className={cn('relative isolate w-full overflow-hidden bg-cream', className)}>
      <div className={CONTAINER}>
        <div className="grid grid-cols-1 lg:min-h-[84vh] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-x-20">
          {/* Texte */}
          <div className="flex flex-col justify-center pb-12 pt-12 sm:pt-16 lg:py-20">
            <h1 className="font-display font-normal text-charcoal">
              <span className="block text-[15vw] leading-[0.92] tracking-[-0.03em] sm:text-[11vw] lg:text-[clamp(4.5rem,9vw,9rem)]">
                <span className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
                  <span className="hero-line block">Toiletteur</span>
                </span>{' '}
                <span className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
                  <span className="hero-line block" style={{ animationDelay: '90ms' }}>
                    à Paris<span className="sr-only"> :</span>
                  </span>
                </span>
              </span>{' '}
              <span className="mt-5 block overflow-hidden pb-[0.2em] text-[5.5vw] italic leading-[1.2] tracking-[-0.01em] text-terracotta-dark sm:text-[4.2vw] lg:mt-7 lg:text-[clamp(1.75rem,2.5vw,2.5rem)]">
                <span className="hero-line block" style={{ animationDelay: '180ms' }}>
                  toilettage, spa, crèche &amp; éducation
                </span>
              </span>
            </h1>

            <p className="text-balance mt-7 max-w-md text-base leading-relaxed text-charcoal/70 lg:mt-9 lg:text-lg">
              {noOrphan(subtitle)}
            </p>

            <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
              <Button
                asChild
                size="lg"
                className="h-12 bg-terracotta-dark px-8 text-[15px] text-white hover:bg-terracotta-dark/90"
              >
                <Link href="/reservation">Prendre rendez-vous</Link>
              </Button>
              <a
                href={PHONE_HREF}
                aria-label={`Appeler le ${SITE_CONFIG.phone}`}
                className={cn(TEXT_LINK.light, 'self-start text-xl sm:self-auto')}
              >
                {SITE_CONFIG.phone}
              </a>
            </div>
          </div>

          {/* Collage */}
          <div className="relative flex items-center pb-12 pt-10 lg:py-16">
            <div
              aria-hidden="true"
              className="absolute bottom-[20%] left-[42%] top-0 -z-10 w-screen bg-rose"
            />

            <div className="relative ml-8 w-full sm:ml-12 lg:ml-0">
              <div className="hero-curtain relative aspect-[1800/2050] w-full overflow-hidden">
                <Image
                  src="/hero-vitrine.jpg"
                  alt="Devanture bleu marine de la boutique merci murphy®, rue Victor Massé à Paris, Murphy assis sur le seuil"
                  fill
                  priority
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                  className="object-cover"
                  sizes="(min-width: 1024px) 40vw, 90vw"
                />
              </div>

              <div className="absolute left-0 top-[34%] w-24 -translate-x-1/3 sm:w-28 lg:w-36 lg:-translate-x-1/2">
                <div className="hero-medallion relative aspect-[3/4] w-full overflow-hidden rounded-[50%] border-[5px] border-cream bg-cream">
                  <div className="absolute left-0 top-[-41%] aspect-square w-[190%]">
                    <Image
                      src="/murphy.jpg"
                      alt="Murphy, le carlin noir de la maison"
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bandeau */}
        <div className="flex flex-col gap-2 border-t border-charcoal/15 py-5 text-sm text-charcoal/70 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="font-display text-base italic text-charcoal">
            Vivre heureux avec son chien et son chat à Paris.
          </p>
          <address className="not-italic">{SITE_CONFIG.address}</address>
        </div>
      </div>
    </section>
  )
}
