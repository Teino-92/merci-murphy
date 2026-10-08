// src/app/(marketing)/api/cron/blog-pipeline/route.ts
// Cron Vercel mar/jeu 9h Paris (7h UTC, voir vercel.json).
// Mardi = article race ("Vivre avec un X à Paris"), jeudi = sujet thématique (blogTopic).
// Override manuel : ?type=race|topic, ?race=<slugRace>, ?dry=1 (aucune écriture, pas d'email).

import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { runBlogPipeline, type BlogRunType } from '@/lib/blog-pipeline'
import {
  blogDraftHtml,
  blogDraftSubject,
  blogErrorHtml,
  blogPublishedHtml,
  blogPublishedSubject,
} from '@/lib/emails/blog-summary'

export const runtime = 'nodejs'
export const maxDuration = 300

const resend = new Resend(process.env.RESEND_API_KEY)

// Récap publication : Margot + Matteo. Brouillons et erreurs : Matteo uniquement.
const RECAP_RECIPIENTS = ['margot@mercimurphy.com', 'garbugli.matteo92@gmail.com']
const REVIEWER = ['garbugli.matteo92@gmail.com']

function defaultType(): BlogRunType {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris',
    weekday: 'short',
  }).format(new Date())
  return weekday === 'Thu' ? 'topic' : 'race'
}

async function send(to: string[], subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) return
  const from = process.env.RESEND_AUTH_FROM ?? 'bonjour@mercimurphy.com'
  try {
    await resend.emails.send({ from, to, subject, html })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[cron blog-pipeline] email failed:', e)
  }
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params = req.nextUrl.searchParams
  const typeParam = params.get('type')
  const type: BlogRunType =
    typeParam === 'race' || typeParam === 'topic' ? typeParam : defaultType()
  const dry = params.get('dry') === '1'
  const race = params.get('race') ?? undefined

  try {
    const result = await runBlogPipeline({ type, dry, race })
    if (dry) return NextResponse.json({ ok: true, ...result })

    if (result.status === 'published') {
      revalidateTag('sanity:post')
      revalidatePath('/blog')
      await send(RECAP_RECIPIENTS, blogPublishedSubject(result), blogPublishedHtml(result))
    }
    if (result.status === 'draft') {
      await send(REVIEWER, blogDraftSubject(result), blogDraftHtml(result))
    }

    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    // eslint-disable-next-line no-console
    console.error('[cron blog-pipeline] error:', msg)
    if (!dry) await send(REVIEWER, '[Blog] Pipeline en erreur', blogErrorHtml(msg))
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
