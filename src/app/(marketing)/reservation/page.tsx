import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Section, Container } from '@/components/ui/section'
import { ReservationForm } from '@/components/forms/reservation-form'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getProfile } from '@/lib/auth-actions'
import { SITE_CONFIG } from '@/config/site'

export const metadata: Metadata = {
  title: 'Réservation',
  description:
    'Prenez rendez-vous en ligne pour nos services de toilettage, crèche, éducation et ostéopathie.',
}

export default async function ReservationPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/compte/connexion?redirect=/reservation')

  const profile = await getProfile()

  // Not yet allowed to book — first visit needed
  if (!profile?.can_book) {
    return (
      <>
        <Section className="bg-charcoal text-cream py-20">
          <Container className="max-w-2xl text-center">
            <h1 className="font-display text-4xl font-bold sm:text-6xl">Prendre rendez-vous</h1>
          </Container>
        </Section>
        <Section className="bg-cream">
          <Container className="max-w-xl text-center">
            <div className="rounded-2xl border border-charcoal/10 bg-white p-10 shadow-sm">
              <p className="text-4xl mb-6">🐾</p>
              <h2 className="font-display text-2xl font-bold text-charcoal">
                Première visite en boutique requise
              </h2>
              <p className="mt-4 text-charcoal/60 leading-relaxed">
                Pour garantir le meilleur soin à votre chien, nous activons la réservation en ligne
                après votre première visite en boutique. Notre équipe pourra ainsi faire
                connaissance avec vous et votre compagnon.
              </p>
              <p className="mt-6 text-charcoal/60">
                Pour votre première réservation, contactez-nous directement :
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
                {SITE_CONFIG.phone && (
                  <a
                    href={`tel:${SITE_CONFIG.phone}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-terracotta px-6 py-3 text-sm font-medium text-white hover:bg-terracotta/90 transition-colors"
                  >
                    Nous appeler
                  </a>
                )}
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-charcoal/20 px-6 py-3 text-sm font-medium text-charcoal hover:bg-charcoal/5 transition-colors"
                >
                  Nous contacter
                </Link>
              </div>
            </div>
          </Container>
        </Section>
      </>
    )
  }

  return (
    <>
      <Section className="bg-charcoal text-cream py-20">
        <Container className="max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-6xl">Prendre rendez-vous</h1>
          <p className="mt-4 text-lg text-cream/70">
            Remplissez le formulaire et notre équipe vous rappelle pour confirmer.
          </p>
        </Container>
      </Section>
      <Section className="bg-cream">
        <Container className="max-w-xl">
          <ReservationForm
            defaultValues={{
              nom: profile?.nom ?? '',
              email: user.email ?? '',
              telephone: profile?.telephone ?? '',
              race_chien: profile?.race_chien ?? '',
              poids_chien: profile?.poids_chien ?? '',
              etat_poil: profile?.etat_poil ?? '',
            }}
          />
        </Container>
      </Section>
    </>
  )
}
