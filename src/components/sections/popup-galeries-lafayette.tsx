import Image from 'next/image'

import { CONTAINER, TEXT_LINK } from '@/components/ui/editorial'
import { cn } from '@/lib/utils'

// TEMPORAIRE — à retirer après l'événement.
const EVENT_URL =
  'https://www.galerieslafayette.com/m/magasin-haussmann/en-ce-moment/pop-up-merci-murphy'

// Logo servi par le CDN Brandfetch (hotlink exigé par leurs conditions).
// Sans client ID, on retombe sur le nom en texte.
const BRANDFETCH_CLIENT_ID = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID
const LOGO_URL = BRANDFETCH_CLIENT_ID
  ? `https://cdn.brandfetch.io/galerieslafayette.com/w/400/h/80/theme/light/logo?c=${BRANDFETCH_CLIENT_ID}`
  : null

/**
 * Annonce du pop-up merci murphy® aux Galeries Lafayette Haussmann.
 * Photo du corner + texte, entre le blog et Instagram sur la home.
 */
export function PopUpGaleriesLafayette() {
  return (
    <section aria-labelledby="popup-gl-title" className="bg-rose py-14 lg:py-20">
      <div
        className={cn(
          CONTAINER,
          'grid grid-cols-1 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-x-16'
        )}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src="/popup-galeries-lafayette.png"
            alt="Le corner merci murphy® aux Galeries Lafayette Haussmann : jouets, friandises et accessoires"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 45vw, 100vw"
          />
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-terracotta-dark">En ce moment</p>
          <h2
            id="popup-gl-title"
            className="mt-3 font-display text-3xl leading-tight text-charcoal lg:text-4xl"
          >
            {LOGO_URL ? (
              <>
                merci murphy® s&apos;installe aux
                <span className="sr-only"> Galeries Lafayette</span>
                <Image
                  src={LOGO_URL}
                  alt=""
                  width={400}
                  height={80}
                  unoptimized
                  className="mt-4 block h-10 w-auto lg:h-12"
                />
              </>
            ) : (
              <>merci murphy® s&apos;installe aux Galeries Lafayette</>
            )}
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-charcoal/75">
            Retrouvez notre pop-up au magasin Haussmann&nbsp;: nos produits, notre univers, et
            l&apos;équipe pour vous conseiller.
          </p>
          <a
            href={EVENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(TEXT_LINK.light, 'mt-7 inline-block')}
          >
            Découvrir le pop-up
          </a>
        </div>
      </div>
    </section>
  )
}
