// One-shot script — push all active newsletter_subscribers to Resend audience
// Usage: npx tsx scripts/backfill-resend-audience.ts
import { readFileSync } from 'fs'
import { resolve } from 'path'

const envPath = resolve(process.cwd(), '.env.local')
const envLines = readFileSync(envPath, 'utf-8').split('\n')
for (const line of envLines) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}

import('resend').then(async ({ Resend }) => {
  const { createClient } = await import('@supabase/supabase-js')

  const resend = new Resend(process.env.RESEND_API_KEY!)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const audienceId = process.env.RESEND_AUDIENCE_ID!
  if (!audienceId) throw new Error('RESEND_AUDIENCE_ID manquant')

  const { data: subscribers, error } = await supabase
    .from('newsletter_subscribers')
    .select('email')
    .eq('active', true)

  if (error) throw error
  if (!subscribers?.length) {
    console.log('Aucun subscriber actif.')
    return
  }

  console.log(`${subscribers.length} subscribers à synchroniser...`)

  let ok = 0
  let fail = 0

  for (const { email } of subscribers) {
    const { error: resendError } = await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    })
    if (resendError) {
      console.error(`✗ ${email}:`, JSON.stringify(resendError))
      fail++
    } else {
      console.log(`✓ ${email}`)
      ok++
    }
    // Rate limit prudent
    await new Promise((r) => setTimeout(r, 100))
  }

  console.log(`\nTerminé — ${ok} ajoutés, ${fail} erreurs.`)
})
