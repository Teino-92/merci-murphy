/**
 * Test local du pipeline blog, sans aucune écriture Sanity ni email.
 *
 * Usage : npm run blog:dry -- race [slugRace]
 *         npm run blog:dry -- topic
 */

import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: join(__dirname, '..', '..', '.env.local') })

async function main() {
  const { runBlogPipeline } = await import('../../src/lib/blog-pipeline')
  const type = process.argv[2] === 'topic' ? 'topic' : 'race'
  const race = process.argv[3]
  const started = Date.now()
  const result = await runBlogPipeline({ type, dry: true, race })
  const out = join(__dirname, `dry-run-${type}.json`)
  writeFileSync(out, JSON.stringify(result, null, 2))
  console.log(
    `[blog:dry] ${result.status} · ${result.title ?? result.reason} · ${result.wordCount ?? 0} mots · ${Math.round((Date.now() - started) / 1000)}s`
  )
  for (const i of result.issues) console.log(`  - ${i}`)
  console.log(`[blog:dry] détail : ${out}`)
}

main().catch((e) => {
  console.error('[blog:dry]', e)
  process.exit(1)
})
