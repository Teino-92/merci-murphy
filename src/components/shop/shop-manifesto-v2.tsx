import { CONTAINER, DisplayTitle, RULED_ITEM, RULED_LIST } from '@/components/ui/editorial'
import { cn } from '@/lib/utils'
import { noOrphan } from '@/lib/typo'

const BRAND = <span className="font-medium text-charcoal">merci murphy®</span>

// Textes repris de ShopManifesto (prod). Seules les accroches en Playfair sont
// nouvelles : ce sont des paragraphes, pas des titres, pour ne pas toucher aux Hn.
const ENGAGEMENTS = [
  {
    key: 'selection',
    lead: 'Une sélection resserrée',
    body: (
      <>
        Le collectif {BRAND} vous propose une offre resserrée de produits, choisis strictement pour
        leurs bénéfices pour votre chien et selon des critères exigeants éco-responsables et
        éthiques. Cela signifie questionner la composition, toutes les étapes de réalisation et la
        durabilité de chaque produit.
      </>
    ),
  },
  {
    key: 'artisans',
    lead: 'Des artisans passionnés',
    body: (
      <>
        {BRAND} aime le vrai et les savoir-faire des passionnés. La plupart de nos
        fournisseurs-partenaires sont des artisans locaux. Nos produits voyagent le moins possible —
        fabrication engagé pour favoriser la mixité dans l&apos;entreprenariat. {BRAND} est engagé
        pour favoriser la mixité dans l&apos;entreprenariat. Nous favorisons les marques dirigées
        par des femmes.
      </>
    ),
  },
  {
    key: 'eco',
    lead: 'Éco-responsable, sans cuir animal',
    body: (
      <>
        Seuls les produits éco-responsables — matières premières biologiques, recyclées et
        innovantes, sans compromis sur leur origine et leur traçabilité — entrent dans la sélection.
        Pas de souffrance animale : vous ne trouverez pas de cuir animal chez {BRAND}.
      </>
    ),
  },
  {
    key: 'durabilite',
    lead: 'Seconde main et vrac',
    body: (
      <>
        La durabilité est un critère essentiel. {BRAND} est la première boutique pour chien à
        proposer du <span className="font-medium text-charcoal">second-hand</span> et une
        consommation en vrac. Réutiliser est la meilleure option pour la planète — pour une
        consommation éclairée et responsable.
      </>
    ),
  },
]

/**
 *Engagements de la boutique v2.
 * Le manifeste n'est plus caché derrière « En savoir plus » : il passe sous le
 * catalogue, visible d'emblée, en liste à filets (sans icônes).
 */
export function ShopManifestoV2() {
  return (
    <section
      id="engagements"
      className="scroll-mt-24 border-t border-charcoal/15 bg-cream py-16 lg:py-24"
    >
      <div
        className={cn(
          CONTAINER,
          'grid grid-cols-1 gap-y-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)] lg:gap-x-16'
        )}
      >
        <div className="lg:sticky lg:top-28 lg:self-start">
          <DisplayTitle>Une seule planète</DisplayTitle>
          <p className="text-balance mt-5 max-w-xs text-base leading-relaxed text-charcoal/70 lg:text-lg">
            Nos achats ont un sens — pour nos poilus et pour la planète.
          </p>
        </div>

        <ul className={RULED_LIST}>
          {ENGAGEMENTS.map((e) => (
            <li
              key={e.key}
              className={cn(
                RULED_ITEM,
                'grid gap-3 py-7 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-10 lg:py-9'
              )}
            >
              <p className="font-display text-xl leading-snug text-charcoal lg:text-2xl">
                {noOrphan(e.lead)}
              </p>
              <p className="max-w-prose text-[15px] leading-relaxed text-charcoal/70 lg:text-base">
                {noOrphan(e.body)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
