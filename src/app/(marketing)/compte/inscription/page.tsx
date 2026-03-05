import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Section, Container } from '@/components/ui/section'
import { SignUpForm } from '@/components/forms/signup-form'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Créer un compte',
  description:
    'Créez votre compte Merci Murphy pour gérer les informations de votre chien et faciliter vos réservations.',
}

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect(searchParams.redirect ?? '/reservation')

  return (
    <>
      <Section className="bg-charcoal text-cream py-20">
        <Container className="max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Créer un compte</h1>
          <p className="mt-4 text-lg text-cream/70">
            Enregistrez les informations de votre chien pour simplifier vos prises de rendez-vous.
          </p>
        </Container>
      </Section>
      <Section className="bg-cream">
        <Container className="max-w-xl">
          <SignUpForm />
        </Container>
      </Section>
    </>
  )
}
