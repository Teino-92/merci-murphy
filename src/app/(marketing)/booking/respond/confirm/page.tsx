import { CONTAINER, DisplayTitle } from '@/components/ui/editorial'

interface Props {
  searchParams: { token?: string; kind?: string }
}

export const metadata = { robots: { index: false, follow: false } }

/**
 * Email links land here (GET, no side effect). The slot is only accepted when
 * the client submits the form (POST), so link scanners/prefetchers can't
 * confirm a booking on the client's behalf.
 */
export default function ConfirmSlotPage({ searchParams }: Props) {
  const token = searchParams.token ?? ''
  const action =
    searchParams.kind === 'visit' ? '/api/booking/visit-respond' : '/api/booking/respond'
  const valid = /^[a-f0-9]{64}$/.test(token)

  return (
    <section className="bg-cream py-20 lg:py-32">
      <div className={CONTAINER}>
        <div className="max-w-xl">
          <DisplayTitle as="h1" size="feature">
            {valid ? 'Confirmer ce créneau' : 'Lien invalide'}
          </DisplayTitle>

          {valid ? (
            <form method="post" action={action} className="mt-10">
              <input type="hidden" name="token" value={token} />
              <p className="text-lg leading-relaxed text-charcoal/70">
                Un clic pour valider le créneau proposé par l&apos;équipe merci murphy®.
              </p>
              <button
                type="submit"
                className="mt-8 rounded-full bg-charcoal px-8 py-3 text-sm font-medium text-cream transition hover:bg-charcoal/85"
              >
                Je confirme ce créneau
              </button>
            </form>
          ) : (
            <p className="mt-7 text-lg leading-relaxed text-charcoal/70">
              Ce lien n&apos;est plus valable. Contactez-nous pour fixer un nouveau rendez-vous.
            </p>
          )}

          <p className="mt-10 border-t border-charcoal/15 pt-6 text-sm text-charcoal/60">
            18 rue Victor Massé, 75009 Paris
          </p>
        </div>
      </div>
    </section>
  )
}
