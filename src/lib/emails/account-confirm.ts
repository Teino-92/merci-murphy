// src/lib/emails/account-confirm.ts
import { emailHtml, btn, p, esc } from './base'

export function accountConfirmHtml(prenom: string, confirmUrl: string): string {
  return emailHtml({
    title: 'Confirmez votre adresse email',
    body: [
      p(`Bonjour ${esc(prenom)},`),
      p(
        'Merci pour votre inscription chez merci murphy®. Pour activer votre compte, confirmez votre adresse email :'
      ),
      btn('Confirmer mon email', confirmUrl),
      p(
        '<span style="font-size:13px;color:#888;">Vous n’êtes pas à l’origine de cette inscription ? Ignorez simplement cet email, aucun compte ne sera activé.</span>'
      ),
    ].join('\n'),
  })
}
