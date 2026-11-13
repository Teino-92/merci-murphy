import type { ReactNode } from 'react'

import { PageHeaderV2 } from '@/components/sections/page-header-v2'
import { CONTAINER } from '@/components/ui/editorial'
import { cn } from '@/lib/utils'

// Le corps des pages légales est repris tel quel de la prod : la typo de
// lecture est réglée depuis le conteneur (sélecteurs descendants, plus
// spécifiques que les classes inline du corps). Chaque <div> enfant est un
// article, séparé par un filet.
const LEGAL_BODY = cn(
  'max-w-2xl text-base leading-[1.75] text-charcoal/80 lg:text-[17px]',
  '[&>div]:border-t [&>div]:border-charcoal/15 [&>div]:py-9 lg:[&>div]:py-11',
  '[&>div:last-child]:border-b',
  '[&_h2]:mb-5 [&_h2]:text-[1.5rem] [&_h2]:font-normal [&_h2]:leading-snug lg:[&_h2]:text-[1.75rem]',
  '[&_li]:leading-[1.7]',
  '[&_a]:rounded-sm [&_a]:text-charcoal [&_a]:underline [&_a]:decoration-terracotta [&_a]:decoration-1 [&_a]:underline-offset-4 [&_a]:transition-colors [&_a:hover]:text-terracotta-dark',
  '[&_a:focus-visible]:outline [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-terracotta-dark'
)

/**
 *Gabarit des pages légales v2.
 * H1 dans l'en-tête cream (sans image), éventuelle introduction et date de
 * mise à jour en dessous ; le corps (H2 identiques à la prod) passe sur fond
 * blanc, en mesure de lecture, articles séparés par des filets.
 */
export function LegalPageV2({
  title,
  updatedAt,
  intro,
  children,
}: {
  title: string
  updatedAt?: string
  intro?: ReactNode
  children: ReactNode
}) {
  return (
    <>
      <PageHeaderV2
        title={title}
        sub={updatedAt ? `Dernière mise à jour : ${updatedAt}` : undefined}
        intro={intro}
      />

      <section className="bg-white py-14 lg:py-20">
        <div className={CONTAINER}>
          <div className={LEGAL_BODY}>{children}</div>
        </div>
      </section>
    </>
  )
}
