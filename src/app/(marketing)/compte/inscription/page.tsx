import type { Metadata } from 'next'
import { Section, Container } from '@/components/ui/section'
import { SignUpForm } from '@/components/forms/signup-form'

export const metadata: Metadata = {
  title: 'Créer un compte',
  description:
    'Créez votre compte merci murphy® pour gérer les informations de votre chien et faciliter vos réservations.',
}

export default function InscriptionPage() {
  return (
    <>
      <div style={{ backgroundColor: '#B5A89A' }}>
        <Section className="text-charcoal py-20">
          <Container className="max-w-2xl text-center">
            <h1 className="font-display text-4xl font-bold sm:text-6xl">Créer un compte</h1>
            <p className="mt-4 text-lg text-charcoal/60">
              Enregistrez les informations de votre chien pour simplifier vos prises de rendez-vous.
            </p>
          </Container>
        </Section>
      </div>
      <Section className="bg-cream">
        <Container className="max-w-xl">
          <SignUpForm />
        </Container>
      </Section>
    </>
  )
}
