export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Section, Container } from '@/components/ui/section'
import { ReservationForm } from '@/components/forms/reservation-form'
import { SlotPicker } from '@/components/forms/slot-picker'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getProfile, getDogs } from '@/lib/auth-actions'

export const metadata: Metadata = {
  title: 'Réservation',
  description:
    'Prenez rendez-vous en ligne pour nos services de toilettage, crèche, éducation et ostéopathie.',
}

export default async function ReservationPage({
  searchParams,
}: {
  searchParams: { contact?: string }
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/compte/connexion?redirect=/reservation')

  const [profile, dogs] = await Promise.all([getProfile(), getDogs()])
  // ?contact=1 forces the callback form regardless of can_book
  const showForm = !profile?.can_book || searchParams.contact === '1'
  const firstDog = dogs[0] ?? null

  return (
    <>
      <div style={{ backgroundColor: '#B5A89A' }}>
        <Section className="text-charcoal py-20">
          <Container className="max-w-2xl text-center">
            <h1 className="font-display text-4xl font-bold sm:text-6xl">Prendre rendez-vous</h1>
            <p className="mt-4 text-lg text-charcoal/60">
              {showForm
                ? 'Remplissez le formulaire et notre équipe vous appellera dans les plus brefs délais pour organiser votre rendez-vous.'
                : 'Choisissez votre service et réservez votre créneau directement.'}
            </p>
          </Container>
        </Section>
      </div>
      <Section className="bg-cream">
        <Container className="max-w-2xl">
          {showForm ? (
            <ReservationForm
              defaultValues={{
                nom: profile?.nom ?? '',
                email: user.email ?? '',
                telephone: profile?.telephone ?? '',
                race_chien: firstDog?.breed ?? '',
                poids_chien: firstDog?.poids ?? '',
                etat_poil: firstDog?.etat_poil ?? '',
              }}
            />
          ) : (
            <SlotPicker profile={profile!} dogs={dogs} />
          )}
        </Container>
      </Section>
    </>
  )
}
