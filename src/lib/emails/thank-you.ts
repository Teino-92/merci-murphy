// src/lib/emails/thank-you.ts
import { emailHtml, btn, p, esc } from './base'

interface ProductCard {
  title: string
  handle: string
  imageUrl: string | null
  price: string
}

export function thankYouHtml(params: {
  dogName: string | null
  serviceName: string
  googleReviewUrl: string
  products: ProductCard[]
}): string {
  const { dogName, serviceName, googleReviewUrl, products } = params
  const dogText = dogName ? `<strong>${esc(dogName)}</strong> et vous` : 'vous'

  const productCards = products
    .map(
      (p) => `
    <td align="center" style="padding:8px;width:33%;" valign="top">
      <a href="https://mercimurphy.com/shop/${esc(p.handle)}" style="text-decoration:none;color:#1D164E;">
        ${p.imageUrl ? `<img src="${esc(p.imageUrl)}" alt="${esc(p.title)}" width="140" style="border-radius:8px;display:block;margin:0 auto 8px;" />` : ''}
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#1D164E;">${esc(p.title)}</p>
        <p style="margin:0;font-size:12px;color:#888;">${esc(p.price)} €</p>
      </a>
    </td>`
    )
    .join('')

  const productsBlock =
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

  return emailHtml({
    title: 'Merci pour votre visite — merci murphy®',
    body: [
      p('Bonjour,'),
      p(
        `Merci pour votre visite aujourd'hui ! Nous espérons que ${dogText} êtes repartis heureux de votre séance de <strong>${esc(serviceName).toLowerCase()}</strong>.`
      ),
      p(
        'Votre avis compte beaucoup pour nous. Si vous avez été satisfait(e), nous serions ravis que vous partagiez votre expérience en ligne — cela nous aide énormément !'
      ),
      btn('Laisser un avis Google ⭐', googleReviewUrl),
      productsBlock,
      p("À très bientôt,<br><strong>L'équipe merci murphy</strong>"),
    ].join('\n'),
  })
}
