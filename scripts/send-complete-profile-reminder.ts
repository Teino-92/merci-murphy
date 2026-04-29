// One-shot script — send "complete your profile" reminder to accounts without a dog
// Usage: npx tsx scripts/send-complete-profile-reminder.ts
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Manually load .env.local since dotenv may not be installed
const envPath = resolve(process.cwd(), '.env.local')
const envLines = readFileSync(envPath, 'utf-8').split('\n')
for (const line of envLines) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
}

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { emailHtml, btn, p } from '../src/lib/emails/base'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)

const TARGET_EMAILS = [
  'jeremie.mourier.15@gmail.com',
  'oyanalandaburu@live.fr',
  'sophielalloz@icloud.com',
  'jantri123@gmail.com',
]

function reminderHtml(): string {
  return emailHtml({
    title: 'Finalisez votre inscription merci murphy®',
    body: [
      p('Bonjour,'),
      p(
        `Vous avez créé votre compte merci murphy® mais n'avez pas encore ajouté le profil de votre chien.`
      ),
      p(
        'Pour accéder à la réservation en ligne et à toutes les fonctionnalités de votre espace, il vous suffit de compléter le profil de votre chien en quelques secondes.'
      ),
      btn('Compléter mon profil', 'https://mercimurphy.com/compte'),
      p(
        '<span style="font-size:13px;color:#888;">Une question ? Écrivez-nous à <a href="mailto:bonjour@mercimurphy.com" style="color:#B85C38;">bonjour@mercimurphy.com</a></span>'
      ),
    ].join('\n'),
  })
}

async function main() {
  // Fetch auth users for target emails
  const { data: allUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const users = (allUsers?.users ?? []).filter((u) => TARGET_EMAILS.includes(u.email ?? ''))

  if (users.length === 0) {
    console.log('No matching users found.')
    return
  }

  for (const user of users) {
    // Check if they have a dog
    const { data: dogs } = await supabase.from('dogs').select('id').eq('owner_id', user.id).limit(1)
    if (dogs && dogs.length > 0) {
      console.log(`${user.email} — already has a dog, skipping`)
      continue
    }

    // Get their prenom from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('nom')
      .eq('id', user.id)
      .single()
    const prenom = profile?.nom?.split(' ')[0] ?? 'là'

    const { error } = await resend.emails.send({
      from: `merci murphy® <${process.env.RESEND_AUTH_FROM}>`,
      to: user.email!,
      subject: `${prenom}, finalisez votre inscription merci murphy® 🐾`,
      html: reminderHtml(),
    })

    if (error) {
      console.error(`${user.email} — FAILED:`, error)
    } else {
      console.log(`${user.email} — sent ✓`)
    }
  }
}

main().catch(console.error)
