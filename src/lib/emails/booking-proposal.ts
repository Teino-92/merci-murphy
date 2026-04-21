import { emailHtml, btn, p, divider, esc } from './base'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mercimurphy.com'

export function bookingProposalHtml(params: {
  clientName: string
  dogName: string | null
  serviceName: string
  proposedDate: string
  token: string
}): string {
  const { clientName, dogName, serviceName, proposedDate, token } = params

  const acceptUrl = `${BASE_URL}/api/booking/respond?token=${token}&action=accept`
  const declineUrl = `${BASE_URL}/booking/respond/decline?token=${token}`

  const subject = dogName
    ? `le rendez-vous de <strong>${esc(dogName)}</strong> pour son ${esc(serviceName).toLowerCase()}`
    : `votre rendez-vous pour ${esc(serviceName).toLowerCase()}`

  return emailHtml({
    title: 'Proposition de rendez-vous — merci murphy®',
    body: [
      p(`Bonjour ${esc(clientName)},`),
      p(`Nous vous proposons un nouveau créneau pour ${subject}.`),
      p(`📅 <strong>${esc(proposedDate)}</strong>`),
      p('📍 18 rue Victor Massé, 75009 Paris'),
      divider(),
      p('Ce créneau vous convient ?'),
      btn('✅ Accepter ce créneau', acceptUrl),
      btn('❌ Refuser et proposer une autre date', declineUrl),
      divider(),
      p("À bientôt,<br><strong>L'équipe merci murphy®</strong>"),
    ].join('\n'),
  })
}
