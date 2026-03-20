import type { Metadata } from 'next'
import { Section, Container } from '@/components/ui/section'
import { ForgotPasswordForm } from '@/components/forms/forgot-password-form'

export const metadata: Metadata = {
  title: 'Mot de passe oublié',
  description: 'Réinitialisez votre mot de passe merci murphy®.',
  robots: { index: false },
}

export default function ForgotPasswordPage() {
  return (
    <>
      <Section className="bg-charcoal-light text-cream py-20">
        <Container className="max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-6xl">Mot de passe oublié</h1>
          <p className="mt-4 text-lg text-cream/70">
            Entrez votre email et nous vous enverrons un lien de réinitialisation.
          </p>
        </Container>
      </Section>
      <Section className="bg-cream">
        <Container className="max-w-sm">
          <ForgotPasswordForm />
        </Container>
      </Section>
    </>
  )
}
