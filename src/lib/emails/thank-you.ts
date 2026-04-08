// src/lib/emails/thank-you.ts

interface ProductCard {
  title: string
  handle: string
  imageUrl: string | null
  price: string // e.g. '24.90'
}

export function thankYouHtml(params: {
  dogName: string | null
  serviceName: string
  googleReviewUrl: string
  products: ProductCard[]
}): string {
  const { dogName, serviceName, googleReviewUrl, products } = params
  const dogText = dogName ? `${dogName} et vous` : 'vous'

  const productCards = products
    .map(
      (p) => `
    <td align="center" style="padding:8px;width:33%;" valign="top">
      <a href="https://mercimurphy.com/shop/${p.handle}" style="text-decoration:none;color:#1D164E;">
        ${
          p.imageUrl
            ? `<img src="${p.imageUrl}" alt="${p.title}" width="140" style="border-radius:8px;display:block;margin:0 auto 8px;" />`
            : ''
        }
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#1D164E;">${p.title}</p>
        <p style="margin:0;font-size:12px;color:#888;">${p.price} €</p>
      </a>
    </td>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Merci pour votre visite — merci murphy®</title></head>
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
    Merci pour votre visite aujourd'hui ! Nous espérons que ${dogText} êtes repartis heureux de votre séance de <strong>${serviceName.toLowerCase()}</strong>.
  </p>
  <p style="margin:0 0 32px;font-size:15px;color:#4a4a4a;line-height:1.6;">
    Votre avis compte beaucoup pour nous. Si vous avez été satisfait(e), nous serions ravis que vous partagiez votre expérience en ligne — cela nous aide énormément !
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 40px;">
    <tr><td align="center">
      <a href="${googleReviewUrl}" style="display:inline-block;background:#B85C38;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:100px;">
        Laisser un avis Google ⭐
      </a>
    </td></tr>
  </table>
  ${
    products.length > 0
      ? `<p style="margin:0 0 16px;font-size:14px;font-weight:600;color:#1D164E;">Nos coups de cœur du moment</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
    <tr>${productCards}</tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
    <tr><td align="center">
      <a href="https://mercimurphy.com/shop" style="font-size:13px;color:#1D164E;text-decoration:underline;">
        Voir toute la boutique →
      </a>
    </td></tr>
  </table>`
      : ''
  }
  <p style="margin:0;font-size:15px;color:#4a4a4a;line-height:1.6;">
    À très bientôt,<br>
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
