// src/lib/emails/booking-reminder.ts
import { emailHtml, p, esc } from './base'

export function bookingReminderHtml(params: {
  clientName: string
  dogName: string | null
  serviceName: string
  appointmentDate: string
}): string {
  const { clientName, dogName, serviceName, appointmentDate } = params
  const prenom = clientName.split(' ')[0]
  const subject = dogName
    ? `le rendez-vous de <strong>${esc(dogName)}</strong>`
    : 'votre rendez-vous'

  return emailHtml({
    title: 'Rappel de votre rendez-vous — merci murphy®',
    body: [
      p(`Bonjour ${esc(prenom)},`),
      p(
        `Nous vous rappelons ${subject} pour un <strong>${esc(serviceName).toLowerCase()}</strong> demain <strong>${esc(appointmentDate)}</strong> chez merci murphy.`
      ),
      p('📍 18 rue Victor Massé, 75009 Paris'),
      p(
        "En cas d'empêchement, merci de nous prévenir le plus tôt possible afin que nous puissions proposer ce créneau à un autre client."
      ),
      p("À demain,<br><strong>L'équipe merci murphy</strong>"),
    ].join('\n'),
  })
}
