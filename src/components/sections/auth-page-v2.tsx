import type { ReactNode } from 'react'

import { PageHeaderV2 } from '@/components/sections/page-header-v2'
import { CONTAINER } from '@/components/ui/editorial'
import { cn } from '@/lib/utils'

// Les formulaires de compte sont repris tels quels (logique intacte) : on
// les habille depuis le conteneur, comme sur la page contact BAT. Coins vifs,
// champs et boutons à 48 px, titres sans gras.
const FORM_SKIN = cn(
  '[&_.rounded-md]:rounded-none [&_.rounded-lg]:rounded-none [&_.rounded-full]:rounded-none',
  '[&_.h-9]:h-12 [&_.h-10]:h-12 [&_.font-bold]:font-normal'
)

const WIDTH = {
  sm: 'max-w-sm',
  xl: 'max-w-xl',
} as const

/**
 *Gabarit des pages de compte v2 (connexion, inscription, mot de passe).
 * Le bandeau taupe centré devient l'en-tête cream aligné à gauche ; même H1,
 * même phrase d'introduction. Le formulaire suit sur fond blanc.
 */
export function AuthPageV2({
  title,
  intro,
  width = 'sm',
  children,
}: {
  title: string
  intro: string
  width?: keyof typeof WIDTH
  children: ReactNode
}) {
  return (
    <>
      <PageHeaderV2 title={title} intro={intro} />

      <section className="bg-white py-14 lg:py-20">
        <div className={CONTAINER}>
          <div className={cn(FORM_SKIN, WIDTH[width])}>{children}</div>
        </div>
      </section>
    </>
  )
}
