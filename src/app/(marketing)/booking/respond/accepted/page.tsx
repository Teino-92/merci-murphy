import { CONTAINER, DisplayTitle } from '@/components/ui/editorial'

interface Props {
  searchParams: { deposit?: string }
}

/**
 * Confirmation de créneau, avec une variante selon `?deposit=paid`.
 */
export default function AcceptedPage({ searchParams }: Props) {
  const depositPaid = searchParams.deposit === 'paid'

  return (
    <section className="bg-cream py-20 lg:py-32">
      <div className={CONTAINER}>
        <div className="max-w-xl">
          <DisplayTitle as="h1" size="feature">
            Créneau confirmé&nbsp;!
          </DisplayTitle>

          {depositPaid ? (
            <p className="mt-7 text-lg leading-relaxed text-charcoal/70">
              Merci&nbsp;! Votre nouveau créneau est bien enregistré. Votre acompte reste valable,
              aucune action supplémentaire n&apos;est nécessaire.
            </p>
          ) : (
            <p className="mt-7 text-lg leading-relaxed text-charcoal/70">
              Merci&nbsp;! Nous avons bien pris note de votre confirmation. L&apos;équipe merci
              murphy® vous contactera prochainement avec les détails de paiement.
            </p>
          )}

          <p className="mt-10 border-t border-charcoal/15 pt-6 text-sm text-charcoal/60">
            18 rue Victor Massé, 75009 Paris
          </p>
        </div>
      </div>
    </section>
  )
}
