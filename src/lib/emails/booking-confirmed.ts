// src/lib/emails/booking-confirmed.ts

export function bookingConfirmedHtml(params: {
  clientName: string
  serviceName: string
  appointmentDate: string // e.g. 'vendredi 11 avril 2026 à 14h30'
}): string {
  const { clientName, serviceName, appointmentDate } = params
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Votre réservation est confirmée — merci murphy®</title></head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:Inter,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:48px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="padding:40px 48px;background:#1D164E;text-align:center;">
  <p style="margin:0;color:#f5f0eb;font-size:22px;font-weight:600;letter-spacing:0.02em;">merci murphy®</p>
</td></tr>
<tr><td style="padding:40px 48px;">
  <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;color:#1D164E;">C'est confirmé ! 🐾</h1>
  <p style="margin:0 0 24px;font-size:15px;color:#4a4a4a;line-height:1.6;">Bonjour ${clientName},</p>
  <p style="margin:0 0 24px;font-size:15px;color:#4a4a4a;line-height:1.6;">
    Votre réservation pour <strong>${serviceName}</strong> le <strong>${appointmentDate}</strong> est confirmée.<br>
    Nous avons bien reçu votre acompte — merci !
  </p>
  <p style="margin:0 0 8px;font-size:13px;color:#888;line-height:1.6;">
    Si vous avez la moindre question avant votre rendez-vous, n'hésitez pas à nous contacter.
  </p>
  <p style="margin:0;font-size:13px;color:#888;line-height:1.6;">
    À très bientôt chez merci murphy® !
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
