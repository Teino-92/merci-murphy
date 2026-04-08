// src/lib/emails/deposit-request.ts
import { emailHtml, btn, p } from './base'

export function depositRequestHtml(params: {
  clientName: string // kept for future use
  dogName: string | null
  serviceName: string
  appointmentDate: string
  depositAmount: number
  paymentUrl: string
}): string {
  const { dogName, serviceName, appointmentDate, depositAmount, paymentUrl } = params
  const subject = dogName
    ? `le rendez-vous de <strong>${dogName}</strong> ${appointmentDate} chez merci murphy pour son ${serviceName.toLowerCase()}`
    : `votre rendez-vous ${appointmentDate} chez merci murphy pour le ${serviceName.toLowerCase()}`

  return emailHtml({
    title: 'Confirmez votre réservation — merci murphy®',
    body: [
      p('Bonjour,'),
      p(`Nous vous rappelons ${subject}.`),
      p(
        `Afin de valider définitivement votre créneau, merci de bien vouloir procéder au paiement d'un acompte de <strong>${depositAmount}€</strong> via le lien ci-dessous.`
      ),
      p(
        "En effet en raison d'un grand nombre de non présentations, nous sommes contraints de procéder ainsi pour gérer au mieux le planning.<br><br>Merci de votre compréhension."
      ),
      btn(`Payer l'acompte de ${depositAmount}€`, paymentUrl),
      p("Nous vous souhaitons une bonne journée,<br><strong>L'équipe merci murphy</strong>"),
    ].join('\n'),
  })
}
