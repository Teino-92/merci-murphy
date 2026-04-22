// src/lib/emails/booking-confirmed.ts
import { emailHtml, p } from './base'

export function bookingConfirmedHtml(params: {
  clientName: string
  serviceName: string
  appointmentDate: string
}): string {
  const { clientName, serviceName, appointmentDate } = params
  const prenom = clientName.split(' ')[0]
  return emailHtml({
    title: 'Votre réservation est confirmée — merci murphy®',
    body: [
      p(`Bonjour ${prenom},`),
      p(
        `Votre réservation pour <strong>${serviceName}</strong> le <strong>${appointmentDate}</strong> est confirmée.`
      ),
      p(
        "Si vous avez la moindre question avant votre rendez-vous, n'hésitez pas à nous contacter."
      ),
      p('<strong>À très bientôt chez merci murphy® !</strong>'),
    ].join('\n'),
  })
}
