// src/lib/emails/account-welcome.ts
import { emailHtml, btn, p, esc } from './base'

export function accountWelcomeHtml(prenom: string, nomChien?: string): string {
  const greeting = nomChien
    ? `Bienvenue à vous et à <strong>${esc(nomChien)}</strong> !`
    : `Bienvenue, <strong>${esc(prenom)}</strong> !`

  return emailHtml({
    title: 'Votre compte merci murphy® est créé',
    body: [
      p('Bonjour,'),
      p(greeting),
      p(
        'Votre compte merci murphy® a bien été créé. Notre équipe va vérifier votre profil et activer la réservation en ligne après votre première visite en boutique.'
      ),
      p(
        'Venez nous rendre visite au <strong>18 rue Victor Massé, 75009 Paris</strong>. Notre équipe fera connaissance avec vous et votre chien, et activera votre accès à la réservation en ligne.'
      ),
      btn('Découvrir nos services', 'https://mercimurphy.com/services'),
      p(
        '<span style="font-size:13px;color:#888;">Une question ? Écrivez-nous à <a href="mailto:bonjour@mercimurphy.com" style="color:#8B5A3A;">bonjour@mercimurphy.com</a></span>'
      ),
    ].join('\n'),
  })
}
