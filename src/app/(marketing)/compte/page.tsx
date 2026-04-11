import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getProfile, getDogs, getVisits } from '@/lib/auth-actions'
import { AccountWelcome } from '@/components/account/account-welcome'
import { ProfileCard } from '@/components/account/profile-card'
import { DogsCard } from '@/components/account/dogs-card'
import { BookingCta } from '@/components/account/booking-cta'
import { VisitTimeline } from '@/components/account/visit-timeline'

export const metadata: Metadata = {
  title: 'Mon compte',
  description: 'Votre espace personnel merci murphy®.',
}

export default async function ComptePage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/compte/connexion?redirect=/compte')

  const [profile, dogs, visits] = await Promise.all([getProfile(), getDogs(), getVisits()])

  if (!profile) redirect('/compte/connexion?redirect=/compte')

  const memberSince = new Date(user.created_at).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f0eb' }}>
      <div className="mx-auto max-w-[480px] px-4 py-8 pb-20">
        <AccountWelcome
          prenom={profile.nom.split(' ')[0]}
          memberSince={memberSince}
          canBook={profile.can_book}
        />
        <ProfileCard profile={profile} email={user.email ?? ''} />
        <DogsCard dogs={dogs} groomingDuration={profile.grooming_duration} />
        <BookingCta canBook={profile.can_book} />
        <VisitTimeline visits={visits} dogs={dogs} />
      </div>
    </div>
  )
}
