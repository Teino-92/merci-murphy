// src/lib/emails/deposit-paid.ts
import { emailHtml, p, esc } from './base'

export function depositPaidHtml(params: {
  clientName: string
  dogName: string | null
  serviceName: string
  appointmentDate: string
}): string {
  const { clientName, dogName, serviceName, appointmentDate } = params
  const subject = dogName
    ? `le rendez-vous de <strong>${esc(dogName)}</strong>`
    : `votre rendez-vous`

  return emailHtml({
    title: 'Acompte reçu — merci murphy®',
    body: [
      p('Bonjour,'),
      p(
        `Nous avons bien reçu votre acompte pour ${subject} — <strong>${esc(serviceName)}</strong> le <strong>${esc(appointmentDate)}</strong>, ${esc(clientName)}.`
      ),
      p('Votre créneau est désormais confirmé. Nous avons hâte de vous accueillir !'),
      p(
        "Si vous avez la moindre question avant votre rendez-vous, n'hésitez pas à nous contacter."
      ),
      p('<strong>À très bientôt chez merci murphy® !</strong>'),
    ].join('\n'),
  })
}
