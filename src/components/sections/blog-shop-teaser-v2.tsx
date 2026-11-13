import Link from 'next/link'

import { ProductCard } from '@/components/shop/product-card'
import { CONTAINER, DisplayTitle, TEXT_LINK } from '@/components/ui/editorial'
import type { ShopifyProduct } from '@/lib/shopify'
import { cn } from '@/lib/utils'

const HEADINGS: Record<string, string> = {
  chien: 'Pour votre chien',
  chat: 'Pour votre chat',
}

/**
 *Encart éco-shop des articles, v2.
 * Même H2 et même sélection que BlogShopTeaser ; le surtitre en capitales et
 * les flèches disparaissent, un seul lien « Voir tout » sert desktop et mobile.
 */
export function BlogShopTeaserV2({
  products,
  animal,
}: {
  products: ShopifyProduct[]
  animal?: string | null
}) {
  if (products.length === 0) return null

  return (
    <section className="bg-rose/30 py-16 lg:py-24">
      <div className={CONTAINER}>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <DisplayTitle size="compact">
            {HEADINGS[animal ?? ''] ?? 'Nos coups de cœur'}
          </DisplayTitle>
          <Link href="/shop" className={cn(TEXT_LINK.light, 'shrink-0')}>
            Voir tout l&apos;éco-shop
          </Link>
        </div>

        <div className="-mx-4 mt-10 flex gap-5 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:px-0 lg:mt-12">
          {products.map((product) => (
            <div key={product.id} className="w-48 shrink-0 sm:w-56">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
