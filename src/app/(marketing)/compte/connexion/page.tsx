import type { Metadata } from 'next'
import { Suspense } from 'react'

import { SignInForm } from '@/components/forms/signin-form'
import { AuthPageV2 } from '@/components/sections/auth-page-v2'

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre compte merci murphy®.',
}

export default function ConnexionPage() {
  return (
    <AuthPageV2
      title="Se connecter"
      intro="Accédez à votre espace et retrouvez les informations de votre chien."
    >
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthPageV2>
  )
}
