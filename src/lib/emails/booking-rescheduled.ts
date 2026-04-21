import { emailHtml, btn, p, divider, esc } from './base'

const BOUTIQUE_EMAIL = process.env.RESEND_INTERNAL_EMAIL ?? 'bonjour@mercimurphy.com'

export function bookingRescheduledHtml(params: {
  dogName: string | null
  serviceName: string
  newDate: string
  acceptUrl: string
}): string {
  const { dogName, serviceName, newDate, acceptUrl } = params

  const dogLabel = dogName ? esc(dogName) : 'mon chien'
  const serviceLabel = esc(serviceName).toLowerCase()

  const declineSubject = encodeURIComponent(`❌ Ce créneau ne me convient pas — ${dogLabel}`)
  const declineBody = encodeURIComponent(
    `Bonjour,\n\nLe créneau du ${esc(newDate)} ne me convient pas.\n\nMes disponibilités : `
  )

  const declineUrl = `mailto:${BOUTIQUE_EMAIL}?subject=${declineSubject}&body=${declineBody}`

  const subject = dogName
    ? `le rendez-vous de <strong>${esc(dogName)}</strong> pour son ${serviceLabel}`
    : `votre rendez-vous pour ${serviceLabel}`

  return emailHtml({
    title: 'Nouveau créneau — merci murphy®',
    body: [
      p('Bonjour,'),
      p(`Nous vous proposons un nouveau créneau pour ${subject}.`),
      p(`📅 <strong>${esc(newDate)}</strong>`),
      p('📍 18 rue Victor Massé, 75009 Paris'),
      divider(),
      p('Ce créneau vous convient ?'),
      btn('✅ Oui, ce créneau me convient', acceptUrl),
      btn('❌ Non, proposer une autre date', declineUrl),
      divider(),
      p("À bientôt,<br><strong>L'équipe merci murphy®</strong>"),
    ].join('\n'),
  })
}
