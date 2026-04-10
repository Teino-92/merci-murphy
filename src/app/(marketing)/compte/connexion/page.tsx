import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Section, Container } from '@/components/ui/section'
import { SignInForm } from '@/components/forms/signin-form'

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre compte merci murphy®.',
}

// Static page — no auth check server-side (middleware handles logged-in redirect,
// SignInForm handles the redirectTo param client-side via useSearchParams)
export default function ConnexionPage() {
  return (
    <>
      <div style={{ backgroundColor: '#B5A89A' }}>
        <Section className="text-charcoal py-20">
          <Container className="max-w-2xl text-center">
            <h1 className="font-display text-4xl font-bold sm:text-6xl">Se connecter</h1>
            <p className="mt-4 text-lg text-charcoal/60">
              Accédez à votre espace et retrouvez les informations de votre chien.
            </p>
          </Container>
        </Section>
      </div>
      <Section className="bg-cream">
        <Container className="max-w-sm">
          <Suspense>
            <SignInForm />
          </Suspense>
        </Container>
      </Section>
    </>
  )
}
