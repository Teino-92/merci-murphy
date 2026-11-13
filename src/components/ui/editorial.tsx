import type { ReactNode } from 'react'

import { noOrphan } from '@/lib/typo'
import { cn } from '@/lib/utils'

/**
 * Socle du refresh éditorial (home v2 et pages suivantes).
 *
 * Règles à respecter sur toute nouvelle section :
 * - Palette inchangée : cream, rose, terracotta, terracotta-dark, charcoal,
 *   blanc, plus le taupe #B5A89A et l'ardoise #4F6072 déjà en place. Aucune
 *   nouvelle couleur.
 * - Titres en Playfair normal, très grands, interlignage serré (DisplayTitle).
 *   Second niveau en italique terracotta-dark, jamais un mot isolé accentué.
 * - Pas de surtitre en capitales espacées, pas de flèche dans les liens, pas
 *   d'icône dans un cercle, pas de numérotation décorative.
 * - Listes séparées par des filets fins (RULED_LIST / RULED_ITEM) plutôt que
 *   des cartes à ombre. Coins vifs sur les visuels.
 * - Liens secondaires en Playfair souligné (TEXT_LINK) ; un seul bouton plein
 *   par section, en terracotta-dark (charcoal sur taupe).
 * - Aucune animation au défilement : la seule séquence est celle du hero.
 * - Focus clavier toujours visible (FOCUS_RING sur les blocs cliquables).
 */

/** Fond sur lequel l'élément est posé : cream/blanc/rose, taupe ou ardoise. */
export type Surface = 'light' | 'taupe' | 'slate'

export const CONTAINER = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'

export const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta-dark'

// Le terracotta manque de contraste sur le taupe et l'ardoise : le lien y
// reprend la couleur du texte et seul le soulignement s'intensifie au survol.
export const TEXT_LINK: Record<Surface, string> = {
  light:
    'rounded-sm font-display text-lg text-charcoal underline decoration-terracotta decoration-1 underline-offset-[6px] transition-colors hover:text-terracotta-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta-dark',
  taupe:
    'rounded-sm font-display text-lg text-charcoal underline decoration-charcoal/50 decoration-1 underline-offset-[6px] transition-colors hover:decoration-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-charcoal',
  slate:
    'rounded-sm font-display text-lg text-cream underline decoration-cream/50 decoration-1 underline-offset-[6px] transition-colors hover:decoration-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream',
}

/** Lien dans un paragraphe courant : garde la police du texte, seul le soulignement signale le lien. */
export const INLINE_LINK =
  'rounded-sm text-charcoal underline decoration-terracotta decoration-1 underline-offset-4 transition-colors hover:text-terracotta-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta-dark'

/** Liste à filets : RULED_LIST sur le <ul>, RULED_ITEM sur chaque <li>. */
export const RULED_LIST = 'border-b border-charcoal/15'
export const RULED_ITEM = 'border-t border-charcoal/15'

// sm:text-6xl impose son propre interlignage : sm:leading-[0.95] doit suivre.
const TITLE_SIZE = {
  section:
    'text-[13vw] leading-[0.95] tracking-[-0.03em] sm:text-6xl sm:leading-[0.95] lg:text-[clamp(3.5rem,5.4vw,5.5rem)]',
  feature:
    'text-[13vw] leading-[0.95] tracking-[-0.03em] sm:text-6xl sm:leading-[0.95] lg:text-[clamp(3.5rem,6.4vw,6.5rem)]',
  /** Titres longs (une phrase entière) : même voix, un cran plus bas. */
  compact:
    'text-[2.5rem] leading-[1.02] tracking-[-0.02em] sm:text-5xl sm:leading-[1.02] lg:text-[clamp(2.5rem,3.4vw,3.25rem)]',
}

// Corps très grand : on ne soude que les fins de titre courtes (« à Paris »),
// sinon le groupe insécable déborderait en mobile.
const TITLE_TAIL = 28

const TITLE_TONE: Record<Surface, string> = {
  light: 'text-charcoal',
  taupe: 'text-charcoal',
  slate: 'text-cream',
}

/** Ligne italique de second niveau (sous un titre, ou seule sous un h1). */
export const SUB_LINE =
  'text-balance block text-2xl italic leading-[1.25] tracking-[-0.01em] sm:text-3xl sm:leading-[1.25] lg:text-[clamp(1.75rem,2.5vw,2.5rem)]'

export const SUB_TONE: Record<Surface, string> = {
  light: 'text-terracotta-dark',
  taupe: 'text-charcoal',
  slate: 'text-cream/85',
}

interface DisplayTitleProps {
  children: ReactNode
  /** Ligne italique de second niveau, sous le titre. */
  sub?: ReactNode
  as?: 'h1' | 'h2'
  /** `feature` : un cran au-dessus, pour la section phare d'une page. */
  size?: keyof typeof TITLE_SIZE
  surface?: Surface
  className?: string
  /** Ancre (ex. #tarifs). */
  id?: string
}

/** Titre de page ou de section, avec ligne italique optionnelle. */
export function DisplayTitle({
  children,
  sub,
  as: Tag = 'h2',
  size = 'section',
  surface = 'light',
  className,
  id,
}: DisplayTitleProps) {
  if (!sub) {
    return (
      <Tag
        id={id}
        className={cn('font-display font-normal', TITLE_SIZE[size], TITLE_TONE[surface], className)}
      >
        {noOrphan(children, TITLE_TAIL, true)}
      </Tag>
    )
  }

  return (
    <Tag id={id} className={cn('font-display font-normal', TITLE_TONE[surface], className)}>
      <span className={cn('block', TITLE_SIZE[size])}>{noOrphan(children, TITLE_TAIL, true)}</span>{' '}
      <span className={cn(SUB_LINE, 'mt-4 lg:mt-6', SUB_TONE[surface])}>{noOrphan(sub)}</span>
    </Tag>
  )
}
