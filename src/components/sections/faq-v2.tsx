import type { PortableTextBlock } from '@portabletext/react'

import { PortableText } from '@/components/sections/portable-text'
import { CONTAINER, DisplayTitle } from '@/components/ui/editorial'
import { noOrphan } from '@/lib/typo'
import { cn } from '@/lib/utils'

interface FaqItem {
  question: string
  /** Texte simple (FAQ codées en dur) ou Portable Text (FAQ Sanity). */
  reponse: string | PortableTextBlock[]
}

interface FaqV2Props {
  items: FaqItem[]
  title?: string
  /** h3 quand la page actuelle balise déjà ses questions ainsi (revendeurs). */
  questionAs?: 'span' | 'h3'
}

/**
 *FAQ v2, sur l'ardoise de la FAQ actuelle.
 * <details> natif : Server Component, accessible au clavier sans script, et
 * réponses présentes dans le HTML (cohérent avec le JSON-LD FAQPage).
 */
export function FaqV2({ items, title = 'Questions fréquentes', questionAs = 'span' }: FaqV2Props) {
  if (items.length === 0) return null

  const Question = questionAs

  return (
    <section className="bg-[#4F6072] py-16 lg:py-24">
      <div
        className={cn(
          CONTAINER,
          'grid grid-cols-1 gap-y-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)] lg:gap-x-16'
        )}
      >
        <div className="lg:sticky lg:top-28 lg:self-start">
          <DisplayTitle surface="slate">{title}</DisplayTitle>
        </div>

        <div className="border-b border-cream/20">
          {items.map((item) => (
            <details key={item.question} className="group border-t border-cream/20">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-x-6 rounded-sm py-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream lg:py-7 [&::-webkit-details-marker]:hidden">
                <Question className="font-display text-xl leading-snug text-cream sm:text-2xl sm:leading-snug">
                  {noOrphan(item.question)}
                </Question>
                <span
                  aria-hidden="true"
                  className="mt-0.5 font-display text-3xl leading-none text-cream/70 transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                >
                  +
                </span>
              </summary>
              {typeof item.reponse === 'string' ? (
                <p className="max-w-2xl pb-7 text-base leading-relaxed text-cream/80">
                  {noOrphan(item.reponse)}
                </p>
              ) : (
                <PortableText value={item.reponse} light className="max-w-2xl pb-7 text-base" />
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
