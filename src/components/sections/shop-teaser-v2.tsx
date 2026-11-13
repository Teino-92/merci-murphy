import Link from 'next/link'

import { ProductCard } from '@/components/shop/product-card'
import { CONTAINER, DisplayTitle, TEXT_LINK } from '@/components/ui/editorial'
import type { ShopifyProduct } from '@/lib/shopify'
import { cn } from '@/lib/utils'
import { noOrphan } from '@/lib/typo'

interface ShopTeaserV2Props {
  products: ShopifyProduct[]
  title?: string
  intro?: string
}

const IMAGE_OVERRIDES: Record<string, [number, number]> = {
  'bougie-merci-murphy-grand-format-copy': [2, 0],
  'bougie-merci-murphy-sans-un-mot-grand-format-copy': [1, 0],
}

/**
 *Éco-shop v2.
 * Titre à l'échelle du hero à gauche, étagère de produits qui file hors cadre
 * à droite. ProductCard est réutilisé tel quel (logique promo) ; seul le rayon
 * des visuels est resserré depuis le wrapper.
 */
export function ShopTeaserV2({
  products,
  title = 'Éco-shop',
  intro = 'Notre sélection de produits pour votre chien, votre chat, et vous.',
}: ShopTeaserV2Props) {
  if (products.length === 0) return null
  // Un titre long (fiche bains) descend d'un cran pour tenir dans la colonne.
  const titleSize = title.length > 24 ? 'compact' : 'section'

  return (
    <section className="overflow-hidden bg-cream py-16 lg:py-24">
      <div
        className={cn(
          CONTAINER,
          'grid grid-cols-1 gap-y-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)] lg:gap-x-16'
        )}
      >
        <div className="flex flex-col lg:justify-between">
          <div>
            <DisplayTitle size={titleSize}>{title}</DisplayTitle>
            <p className="text-balance mt-5 max-w-xs text-base leading-relaxed text-charcoal/70 lg:text-lg">
              {noOrphan(intro)}
            </p>
          </div>

          <Link href="/shop" className={cn(TEXT_LINK.light, 'mt-8 self-start lg:mt-0')}>
            Voir toute la boutique
          </Link>
        </div>

        <div
          className="-mr-4 overflow-x-auto overflow-y-hidden scrollbar-hide sm:-mr-6 lg:-mr-[max(2rem,calc((100vw-80rem)/2+2rem))]"
          style={{ touchAction: 'pan-x' }}
        >
          <ul className="flex gap-5 pr-4 sm:pr-6 lg:gap-7 lg:pr-8 [&_.rounded-2xl]:rounded-[3px]">
            {products.map((product) => (
              <li key={product.id} className="w-60 shrink-0 sm:w-72 lg:w-80">
                <ProductCard product={product} imageOverride={IMAGE_OVERRIDES[product.handle]} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
