// src/lib/emails/deposit-request.ts

export function depositRequestHtml(params: {
  clientName: string
  serviceName: string
  appointmentDate: string // formatted, e.g. 'vendredi 11 avril 2026 à 14h30'
  depositAmount: number // 60
  paymentUrl: string
}): string {
  const { clientName, serviceName, appointmentDate, depositAmount, paymentUrl } = params
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
  <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;color:#1D164E;">Votre réservation est presque confirmée</h1>
  <p style="margin:0 0 24px;font-size:15px;color:#4a4a4a;line-height:1.6;">Bonjour ${clientName},</p>
  <p style="margin:0 0 24px;font-size:15px;color:#4a4a4a;line-height:1.6;">
    Votre demande de <strong>${serviceName}</strong> le <strong>${appointmentDate}</strong> a bien été reçue.<br>
    Pour la confirmer définitivement, un acompte de <strong>${depositAmount}€</strong> est requis.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
    <tr><td align="center">
      <a href="${paymentUrl}" style="display:inline-block;background:#B85C38;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:100px;">
        Payer l'acompte de ${depositAmount}€
      </a>
    </td></tr>
  </table>
  <p style="margin:0 0 8px;font-size:13px;color:#888;line-height:1.6;">
    Ce lien est valable jusqu'à votre rendez-vous. Sans paiement, votre créneau pourra être libéré.
  </p>
  <p style="margin:0;font-size:13px;color:#888;line-height:1.6;">
    Une question ? Répondez à cet email ou appelez-nous directement.
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
