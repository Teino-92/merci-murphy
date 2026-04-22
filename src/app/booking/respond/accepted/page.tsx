interface Props {
  searchParams: { deposit?: string }
}

export default function AcceptedPage({ searchParams }: Props) {
  const depositPaid = searchParams.deposit === 'paid'

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-5xl mb-6">🐾</p>
        <h1 className="font-display text-3xl font-bold text-charcoal mb-4">Créneau confirmé !</h1>
        {depositPaid ? (
          <p className="text-charcoal/60 leading-relaxed">
            Merci ! Votre nouveau créneau est bien enregistré. Votre acompte reste valable — aucune
            action supplémentaire n&apos;est nécessaire.
          </p>
        ) : (
          <p className="text-charcoal/60 leading-relaxed">
            Merci ! Nous avons bien pris note de votre confirmation. L&apos;équipe merci murphy®
            vous contactera prochainement avec les détails de paiement.
          </p>
        )}
        <p className="mt-6 text-sm text-charcoal/40">📍 18 rue Victor Massé, 75009 Paris</p>
      </div>
    </div>
  )
}
