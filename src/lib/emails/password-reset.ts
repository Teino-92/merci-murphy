// src/lib/emails/password-reset.ts
import { emailHtml, btn, p } from './base'

export function passwordResetHtml(resetUrl: string): string {
  return emailHtml({
    title: 'Réinitialisez votre mot de passe',
    body: [
      p('Bonjour,'),
      p(
        'Vous avez demandé à réinitialiser votre mot de passe merci murphy®. Cliquez sur le bouton ci-dessous pour en choisir un nouveau :'
      ),
      btn('Choisir un nouveau mot de passe', resetUrl),
      p(
        '<span style="font-size:13px;color:#888;">Vous n’êtes pas à l’origine de cette demande ? Ignorez simplement cet email, votre mot de passe reste inchangé.</span>'
      ),
    ].join('\n'),
  })
}
