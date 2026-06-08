// src/app/(marketing)/api/cron/seo-pipeline/route.ts
// Cron Vercel lun/mer/ven 9h Paris (= 8h UTC l'été, 7h UTC l'hiver — voir vercel.json schedule UTC)
// Publie un batch de 3 pages SEO race et envoie email résumé.

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { runSeoPipeline } from '@/lib/seo-pipeline'
import { seoSummaryHtml, seoSummarySubject } from '@/lib/emails/seo-summary'

export const runtime = 'nodejs'
export const maxDuration = 300 // Claude API peut prendre du temps (3 races × ~10s)

const resend = new Resend(process.env.RESEND_API_KEY)

const DEFAULT_BATCH = 3

// Destinataires fixes du rapport SEO (override ADMIN_EMAILS qui inclut bertrand)
const SEO_REPORT_RECIPIENTS = ['margot@mercimurphy.com', 'garbugli.matteo92@gmail.com']

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runSeoPipeline({ batchSize: DEFAULT_BATCH })

    // Email résumé vers margot + matteo (silencieux si pas de RESEND_API_KEY)
    const from = process.env.RESEND_AUTH_FROM ?? 'bonjour@mercimurphy.com'
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from,
          to: SEO_REPORT_RECIPIENTS,
          subject: seoSummarySubject(result),
          html: seoSummaryHtml(result),
        })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[cron seo-pipeline] email failed:', e)
      }
    }

    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    // eslint-disable-next-line no-console
    console.error('[cron seo-pipeline] error:', msg)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
