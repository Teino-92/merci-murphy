// src/lib/emails/booking-reminder.ts

export function bookingReminderHtml(params: {
  dogName: string | null
  serviceName: string
  appointmentDate: string // e.g. 'vendredi 11 avril à 14h30'
}): string {
  const { dogName, serviceName, appointmentDate } = params
  const subject = dogName ? `le rendez-vous de ${dogName}` : 'votre rendez-vous'

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Rappel de votre rendez-vous — merci murphy®</title></head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:Inter,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:48px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="padding:40px 48px;background:#1D164E;text-align:center;">
  <p style="margin:0;color:#f5f0eb;font-size:22px;font-weight:600;letter-spacing:0.02em;">merci murphy®</p>
</td></tr>
<tr><td style="padding:40px 48px;">
  <p style="margin:0 0 16px;font-size:15px;color:#4a4a4a;line-height:1.6;">Bonjour,</p>
  <p style="margin:0 0 16px;font-size:15px;color:#4a4a4a;line-height:1.6;">
    Nous vous rappelons ${subject} pour un <strong>${serviceName.toLowerCase()}</strong> demain <strong>${appointmentDate}</strong> chez merci murphy.
  </p>
  <p style="margin:0 0 16px;font-size:15px;color:#4a4a4a;line-height:1.6;">
    📍 18 rue Victor Massé, 75009 Paris
  </p>
  <p style="margin:0 0 32px;font-size:15px;color:#4a4a4a;line-height:1.6;">
    En cas d'empêchement, merci de nous prévenir le plus tôt possible afin que nous puissions proposer ce créneau à un autre client.
  </p>
  <p style="margin:0;font-size:15px;color:#4a4a4a;line-height:1.6;">
    À demain,<br>
    <strong>L'équipe merci murphy</strong>
  </p>
</td></tr>
<tr><td style="padding:24px 48px;background:#f5f0eb;text-align:center;">
  <p style="margin:0;font-size:12px;color:#888;">merci murphy® · Paris · bonjour@mercimurphy.com</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
}
