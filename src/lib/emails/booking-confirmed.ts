// src/lib/emails/booking-confirmed.ts
import { emailHtml, p } from './base'

export function bookingConfirmedHtml(params: {
  clientName: string
  serviceName: string
  appointmentDate: string
}): string {
  const { clientName, serviceName, appointmentDate } = params
  return emailHtml({
    title: 'Votre réservation est confirmée — merci murphy®',
    body: [
      p('Bonjour,'),
      p(
        `Votre réservation pour <strong>${serviceName}</strong> le <strong>${appointmentDate}</strong> est confirmée, ${clientName}.<br>Nous avons bien reçu votre acompte — merci !`
      ),
      p(
        "Si vous avez la moindre question avant votre rendez-vous, n'hésitez pas à nous contacter."
      ),
      p('<strong>À très bientôt chez merci murphy® !</strong>'),
    ].join('\n'),
  })
}
