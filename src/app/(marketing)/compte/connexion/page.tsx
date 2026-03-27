import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Section, Container } from '@/components/ui/section'
import { SignInForm } from '@/components/forms/signin-form'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre compte merci murphy®.',
}

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect(searchParams.redirect ?? '/compte')

  const redirectTo = searchParams.redirect ?? '/compte'

  return (
    <>
      <Section className="bg-charcoal-light text-cream py-20">
        <Container className="max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-6xl">Se connecter</h1>
          <p className="mt-4 text-lg text-cream/70">
            Accédez à votre espace et retrouvez les informations de votre chien.
          </p>
        </Container>
      </Section>
      <Section className="bg-cream">
        <Container className="max-w-sm">
          <SignInForm redirectTo={redirectTo} />
        </Container>
      </Section>
    </>
  )
}
