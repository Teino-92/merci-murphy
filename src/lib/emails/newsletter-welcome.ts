// src/lib/emails/newsletter-welcome.ts
import { emailHtml, btn, p } from './base'

export function newsletterWelcomeHtml(): string {
  return emailHtml({
    title: 'Bienvenue dans la communauté merci murphy®',
    body: [
      p('Bonjour,'),
      p(
        'Merci de rejoindre la communauté merci murphy® ! Vous serez parmi les premiers à recevoir nos actualités, nos conseils bien-être pour votre chien, et nos offres exclusives.'
      ),
      p('En attendant, découvrez nos services et notre boutique :'),
      btn('Visiter mercimurphy.com', 'https://mercimurphy.com'),
      p(
        '<span style="font-size:13px;color:#888;">Vous recevez cet email car vous vous êtes inscrit·e à la newsletter merci murphy®. Pour vous désabonner, contactez-nous à <a href="mailto:bonjour@mercimurphy.com" style="color:#8B5A3A;">bonjour@mercimurphy.com</a>.</span>'
      ),
    ].join('\n'),
  })
}
