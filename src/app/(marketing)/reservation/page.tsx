export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { ReservationForm } from '@/components/forms/reservation-form'
import { SlotPicker } from '@/components/forms/slot-picker'
import { PageHeaderV2 } from '@/components/sections/page-header-v2'
import { CONTAINER, INLINE_LINK, RULED_ITEM, RULED_LIST } from '@/components/ui/editorial'
import { getDogs, getProfile } from '@/lib/auth-actions'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cn } from '@/lib/utils'
import { getSiteSettings } from '@/sanity/queries/site-settings'
import { noOrphan } from '@/lib/typo'

export const metadata: Metadata = {
  title: 'Réservation',
  description:
    'Prenez rendez-vous en ligne pour nos services de toilettage, crèche, éducation et ostéopathie.',
}

// Les formulaires (prod) sont repris tels quels : seul leur habillage change,
// depuis ce wrapper (coins vifs, titres d'étape en Playfair normal).
const FORM_SKIN =
  '[&_.rounded-2xl]:rounded-none [&_.rounded-xl]:rounded-none [&_h2]:font-normal [&_h2]:text-2xl'

/**
 * Réservation : même garde d'authentification, même
 * choix entre formulaire de rappel et prise de créneau, mêmes valeurs par
 * défaut.
 */
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

  const [profile, dogs, settings] = await Promise.all([getProfile(), getDogs(), getSiteSettings()])
  // ?contact=1 forces the callback form regardless of can_book
  const showForm = !profile?.can_book || searchParams.contact === '1'
  const firstDog = dogs[0] ?? null

  return (
    <>
      <PageHeaderV2
        title="Prendre rendez-vous"
        intro={
          <p>
            {noOrphan(
              showForm
                ? 'Remplissez le formulaire et notre équipe vous appellera dans les plus brefs délais pour organiser votre rendez-vous.'
                : 'Choisissez votre service et réservez votre créneau directement.'
            )}
          </p>
        }
      />

      <section className="border-t border-charcoal/15 bg-cream pb-20 pt-10 lg:pb-28 lg:pt-16">
        <div
          className={cn(
            CONTAINER,
            'grid grid-cols-1 gap-y-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)] lg:gap-x-16'
          )}
        >
          <div className={cn(FORM_SKIN, 'order-1 bg-white p-6 sm:p-10 lg:order-2 lg:p-12')}>
            {showForm ? (
              <ReservationForm
                defaultValues={{
                  nom: profile?.nom ?? '',
                  email: user.email ?? '',
                  telephone: profile?.telephone ?? '',
                  nom_chien: firstDog?.name ?? '',
                  race_chien: firstDog?.breed ?? '',
                  poids_chien: firstDog?.poids ?? '',
                  etat_poil: firstDog?.etat_poil ?? '',
                }}
              />
            ) : (
              <SlotPicker profile={profile!} dogs={dogs} />
            )}
          </div>

          {settings && (
            <aside className="order-2 lg:sticky lg:top-28 lg:order-1 lg:self-start">
              <dl className={cn(RULED_LIST, 'text-charcoal')}>
                <div className={cn(RULED_ITEM, 'py-5')}>
                  <dt className="text-sm text-charcoal/60">Adresse</dt>
                  <dd className="mt-1 font-display text-xl leading-snug">
                    {settings.adresse}
                    <br />
                    {settings.codePostal} {noOrphan(settings.ville)}
                  </dd>
                </div>
                <div className={cn(RULED_ITEM, 'py-5')}>
                  <dt className="text-sm text-charcoal/60">Une question avant de réserver ?</dt>
                  <dd className="mt-1 font-display text-xl leading-snug">
                    <a href={`tel:${settings.telephone}`} className={INLINE_LINK}>
                      {noOrphan(settings.telephone)}
                    </a>
                  </dd>
                </div>
              </dl>
            </aside>
          )}
        </div>
      </section>
    </>
  )
}
