// src/lib/emails/deposit-paid.ts
import { emailHtml, p } from './base'

export function depositPaidHtml(params: {
  clientName: string
  dogName: string | null
  serviceName: string
  appointmentDate: string
}): string {
  const { clientName, dogName, serviceName, appointmentDate } = params
  const subject = dogName ? `le rendez-vous de <strong>${dogName}</strong>` : `votre rendez-vous`

  return emailHtml({
    title: 'Acompte reçu — merci murphy®',
    body: [
      p('Bonjour,'),
      p(
        `Nous avons bien reçu votre acompte pour ${subject} — <strong>${serviceName}</strong> le <strong>${appointmentDate}</strong>, ${clientName}.`
      ),
      p('Votre créneau est désormais confirmé. Nous avons hâte de vous accueillir !'),
      p(
        "Si vous avez la moindre question avant votre rendez-vous, n'hésitez pas à nous contacter."
      ),
      p('<strong>À très bientôt chez merci murphy® !</strong>'),
    ].join('\n'),
  })
}
