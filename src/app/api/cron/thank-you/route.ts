// src/app/api/cron/thank-you/route.ts
// Runs daily at 11:00 Paris time via Vercel cron.
// Finds all confirmed visits that took place yesterday and sends a thank-you email.

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { thankYouHtml } from '@/lib/emails/thank-you'
import { getBestsellingProducts } from '@/lib/shopify-server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const GOOGLE_REVIEW_URL =
  'https://www.google.com/search?q=merci+murphy+Avis&tbm=lcl#lkt=LocalPoiReviews'

const SERVICE_LABELS: Record<string, string> = {
  toilettage: 'Toilettage',
  bains: 'Bains',
  balneo: 'Balnéo',
  massage: 'Massage',
  osteo: 'Ostéopathie',
  education: 'Éducation',
  creche: 'Crèche',
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Yesterday in Paris time
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' })

  const { data: visits, error } = await supabaseAdmin
    .from('visits')
    .select('id, profile_id, service')
    .eq('date', yesterdayStr)
    .eq('status', 'confirmed')

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Cron thank-you query error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!visits || visits.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  // Fetch Shopify bestsellers once for all emails
  const products = await getBestsellingProducts(3).catch(() => [])
  const productCards = products.map((p) => ({
    title: p.title,
    handle: p.handle,
    imageUrl: p.featuredImage?.url ?? null,
    price: parseFloat(p.priceRange.minVariantPrice.amount).toFixed(2),
  }))

  const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  const allUsers = users?.users ?? []

  let sent = 0

  for (const visit of visits) {
    const authUser = allUsers.find((u) => u.id === visit.profile_id)
    if (!authUser?.email) continue

    const { data: firstDog } = await supabaseAdmin
      .from('dogs')
      .select('name')
      .eq('owner_id', visit.profile_id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    const slugBase = visit.service.split('-')[0]
    const serviceName = SERVICE_LABELS[slugBase] ?? visit.service

    try {
      await resend.emails.send({
        from: `merci murphy® <${process.env.RESEND_AUTH_FROM}>`,
        to: authUser.email,
        subject: `Merci pour votre visite chez merci murphy®`,
        html: thankYouHtml({
          dogName: firstDog?.name ?? null,
          serviceName,
          googleReviewUrl: GOOGLE_REVIEW_URL,
          products: productCards,
        }),
      })
      sent++
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Thank-you email failed for visit ${visit.id}:`, err)
    }
  }

  return NextResponse.json({ ok: true, sent, total: visits.length })
}
