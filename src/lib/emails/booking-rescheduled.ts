import { emailHtml, btn, p, divider, esc } from './base'

const BOUTIQUE_EMAIL = process.env.RESEND_INTERNAL_EMAIL ?? 'bonjour@mercimurphy.com'

export function bookingServiceChangedHtml(params: {
  clientName: string
  dogName: string | null
  serviceName: string
  appointmentDate: string
  newDuration: number | null
}): string {
  const { clientName, dogName, serviceName, appointmentDate, newDuration } = params
  const prenom = clientName.split(' ')[0]
  const serviceLabel = esc(serviceName).toLowerCase()

  const subject = dogName
    ? `la prestation de <strong>${esc(dogName)}</strong> pour son ${serviceLabel}`
    : `votre prestation pour ${serviceLabel}`

  const durationLine =
    newDuration != null ? `<br>⏱ Durée ajustée : <strong>${newDuration} min</strong>` : ''

  return emailHtml({
    title: 'Modification de prestation — merci murphy®',
    body: [
      p(`Bonjour ${esc(prenom)},`),
      p(`Suite à votre demande, nous avons modifié ${subject}.`),
      p(`📅 <strong>${esc(appointmentDate)}</strong>${durationLine}`),
      p('📍 18 rue Victor Massé, 75009 Paris'),
      divider(),
      p(
        `Votre acompte reste valable pour ce rendez-vous. Aucune action de votre part n'est nécessaire.`
      ),
      p(`Si vous avez des questions, n'hésitez pas à nous contacter.`),
      divider(),
      p(`À bientôt chez merci murphy® !<br><strong>L'équipe merci murphy®</strong>`),
    ].join('\n'),
  })
}

export function bookingRescheduledHtml(params: {
  clientName: string
  dogName: string | null
  serviceName: string
  newDate: string
  acceptUrl: string
}): string {
  const { clientName, dogName, serviceName, newDate, acceptUrl } = params
  const prenom = clientName.split(' ')[0]

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
      p(`Bonjour ${esc(prenom)},`),
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
