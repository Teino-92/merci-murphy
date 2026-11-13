import type { Metadata } from 'next'

import { SignUpForm } from '@/components/forms/signup-form'
import { AuthPageV2 } from '@/components/sections/auth-page-v2'

export const metadata: Metadata = {
  title: 'Créer un compte',
  description:
    'Créez votre compte merci murphy® pour gérer les informations de votre chien et faciliter vos réservations.',
}

export default function InscriptionPage() {
  return (
    <AuthPageV2
      title="Créer un compte"
      intro="Enregistrez les informations de votre chien pour simplifier vos prises de rendez-vous."
      width="xl"
    >
      <SignUpForm />
    </AuthPageV2>
  )
}
