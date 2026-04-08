// src/lib/sumup.ts
// SumUp Checkout API — create a payment link for a given amount

interface SumUpCheckoutResponse {
  id: string
  checkout_reference: string
  amount: number
  currency: string
  merchant_code: string
  status: string
}

export async function createSumUpCheckout(params: {
  amount: number // in euros, e.g. 60
  reference: string // unique, e.g. `deposit_${visitId}`
  description: string // shown on the payment page
  returnUrl: string // where SumUp redirects after payment
}): Promise<SumUpCheckoutResponse> {
  const res = await fetch('https://api.sumup.com/v0.1/checkouts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SUMUP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      checkout_reference: params.reference,
      amount: params.amount,
      currency: 'EUR',
      merchant_code: process.env.SUMUP_MERCHANT_CODE,
      description: params.description,
      redirect_url: params.returnUrl,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`SumUp checkout creation failed: ${res.status} ${body}`)
  }
  return res.json()
}

export function getSumUpCheckoutUrl(checkoutId: string): string {
  return `https://pay.sumup.com/b2c/checkout/${checkoutId}`
}
