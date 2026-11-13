import type { Metadata } from 'next'

import { ForgotPasswordForm } from '@/components/forms/forgot-password-form'
import { AuthPageV2 } from '@/components/sections/auth-page-v2'

export const metadata: Metadata = {
  title: 'Mot de passe oublié',
  description: 'Réinitialisez votre mot de passe merci murphy®.',
  robots: { index: false },
}

export default function MotDePasseOubliePage() {
  return (
    <AuthPageV2
      title="Mot de passe oublié"
      intro="Entrez votre email et nous vous enverrons un lien de réinitialisation."
    >
      <ForgotPasswordForm />
    </AuthPageV2>
  )
}
