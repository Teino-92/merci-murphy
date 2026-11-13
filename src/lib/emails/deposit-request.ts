// src/lib/emails/deposit-request.ts
import { emailHtml, btn, p, esc } from './base'

export function depositRequestHtml(params: {
  clientName: string
  dogName: string | null
  serviceName: string
  appointmentDate: string
  depositAmount: number
  paymentUrl: string
}): string {
  const { clientName, dogName, serviceName, appointmentDate, depositAmount, paymentUrl } = params
  const prenom = clientName.split(' ')[0]
  const subject = dogName
    ? `le rendez-vous de <strong>${esc(dogName)}</strong> ${appointmentDate} chez merci murphy pour son ${esc(serviceName.toLowerCase())}`
    : `votre rendez-vous ${appointmentDate} chez merci murphy pour le ${esc(serviceName.toLowerCase())}`

  return emailHtml({
    title: 'Confirmez votre réservation — merci murphy®',
    body: [
      p(`Bonjour ${prenom},`),
      p(`Nous vous rappelons ${subject}.`),
      p(
        `Afin de valider définitivement votre créneau, merci de bien vouloir procéder au paiement d'un acompte de <strong>${depositAmount}€</strong> via le lien ci-dessous.`
      ),
      p(
        "En effet en raison d'un grand nombre de non présentations, nous sommes contraints de procéder ainsi pour gérer au mieux le planning.<br><br>Merci de votre compréhension."
      ),
      btn(`Payer l'acompte de ${depositAmount}€`, paymentUrl),
      p("À très bientôt,<br><strong>L'équipe merci murphy</strong>"),
    ].join('\n'),
  })
}
