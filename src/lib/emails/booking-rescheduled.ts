// src/lib/emails/booking-rescheduled.ts
import { emailHtml, p, esc } from './base'

export function bookingRescheduledHtml(params: {
  dogName: string | null
  serviceName: string
  newDate: string // e.g. 'vendredi 15 avril à 10h00'
}): string {
  const { dogName, serviceName, newDate } = params
  const subject = dogName
    ? `le rendez-vous de <strong>${esc(dogName)}</strong>`
    : 'votre rendez-vous'

  return emailHtml({
    title: 'Votre rendez-vous a été déplacé — merci murphy®',
    body: [
      p('Bonjour,'),
      p(
        `Nous vous informons que ${subject} pour un <strong>${esc(serviceName).toLowerCase()}</strong> a été déplacé.`
      ),
      p(
        `Votre nouveau rendez-vous est fixé au <strong>${esc(newDate)}</strong> chez merci murphy.`
      ),
      p('📍 18 rue Victor Massé, 75009 Paris'),
      p("Si ce créneau ne vous convient pas, n'hésitez pas à nous contacter."),
      p("À bientôt,<br><strong>L'équipe merci murphy</strong>"),
    ].join('\n'),
  })
}
