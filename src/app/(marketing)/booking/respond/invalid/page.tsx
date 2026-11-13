import { CONTAINER, DisplayTitle } from '@/components/ui/editorial'

export const metadata = { robots: { index: false, follow: false } }

export default function InvalidRespondPage() {
  return (
    <section className="bg-cream py-20 lg:py-32">
      <div className={CONTAINER}>
        <div className="max-w-xl">
          <DisplayTitle as="h1" size="feature">
            Lien expiré
          </DisplayTitle>
          <p className="mt-7 text-lg leading-relaxed text-charcoal/70">
            Ce lien a déjà été utilisé ou n&apos;est plus valable. Contactez-nous pour fixer un
            nouveau rendez-vous.
          </p>
          <p className="mt-10 border-t border-charcoal/15 pt-6 text-sm text-charcoal/60">
            18 rue Victor Massé, 75009 Paris
          </p>
        </div>
      </div>
    </section>
  )
}
