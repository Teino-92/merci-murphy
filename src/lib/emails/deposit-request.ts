// src/lib/emails/deposit-request.ts

export function depositRequestHtml(params: {
  clientName: string // kept for future use
  dogName: string | null
  serviceName: string
  appointmentDate: string // e.g. 'jeudi 9 avril à 15h45'
  depositAmount: number
  paymentUrl: string
}): string {
  const { dogName, serviceName, appointmentDate, depositAmount, paymentUrl } = params
  const subject = dogName
    ? `le rendez-vous de ${dogName} ${appointmentDate} chez merci murphy pour son ${serviceName.toLowerCase()}`
    : `votre rendez-vous ${appointmentDate} chez merci murphy pour le ${serviceName.toLowerCase()}`

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirmez votre réservation — merci murphy®</title></head>
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
    Nous vous rappelons ${subject}.
  </p>
  <p style="margin:0 0 16px;font-size:15px;color:#4a4a4a;line-height:1.6;">
    Afin de valider définitivement votre créneau, merci de bien vouloir procéder au paiement d'un acompte de <strong>${depositAmount}€</strong> via le lien ci-dessous.
  </p>
  <p style="margin:0 0 32px;font-size:15px;color:#4a4a4a;line-height:1.6;">
    En effet en raison d'un grand nombre de non présentations, nous sommes contraints de procéder ainsi pour gérer au mieux le planning.<br><br>
    Merci de votre compréhension.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
    <tr><td align="center">
      <a href="${paymentUrl}" style="display:inline-block;background:#B85C38;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:100px;">
        Payer l'acompte de ${depositAmount}€
      </a>
    </td></tr>
  </table>
  <p style="margin:0 0 24px;font-size:15px;color:#4a4a4a;line-height:1.6;">
    Nous vous souhaitons une bonne journée,<br>
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
