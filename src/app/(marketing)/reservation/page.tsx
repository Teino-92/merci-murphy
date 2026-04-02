export const revalidate = 3600

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Section, Container } from '@/components/ui/section'
import { ReservationForm } from '@/components/forms/reservation-form'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getProfile } from '@/lib/auth-actions'

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

  return (
    <>
      <div style={{ backgroundColor: '#B5A89A' }}>
        <Section className="text-charcoal py-20">
          <Container className="max-w-2xl text-center">
            <h1 className="font-display text-4xl font-bold sm:text-6xl">Prendre rendez-vous</h1>
            <p className="mt-4 text-lg text-charcoal/60">
              Remplissez le formulaire et notre équipe vous appellera dans les plus brefs délais
              pour organiser votre rendez-vous.
            </p>
          </Container>
        </Section>
      </div>
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
