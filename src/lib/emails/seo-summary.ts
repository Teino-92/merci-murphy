// src/lib/emails/seo-summary.ts
// Email résumé pipeline SEO programmatique (cron lun/mer/ven)

import { emailHtml, esc } from './base'
import type { RunResult } from '@/lib/seo-pipeline'

const SITE = 'https://mercimurphy.com'

export function seoSummarySubject(r: RunResult): string {
  if (r.published.length === 0 && r.failed.length === 0) {
    return '[SEO] Pipeline — rien à publier'
  }
  if (r.failed.length === 0) {
    return `[SEO] ${r.published.length} nouvelles pages publiées`
  }
  return `[SEO] ${r.published.length} publiées · ${r.failed.length} échec(s)`
}

export function seoSummaryHtml(r: RunResult): string {
  const publishedRows = r.published
    .map(
      (slug) =>
        `<li style="margin:0 0 6px;"><a href="${SITE}/toilettage/${esc(slug)}" style="color:#8B5A3A;">${esc(slug)}</a></li>`
    )
    .join('')

  const failedRows = r.failed
    .map(
      (f) =>
        `<li style="margin:0 0 6px;color:#a94442;"><strong>${esc(f.slugRace)}</strong> — ${esc(f.error)}</li>`
    )
    .join('')

  const tokensTotal = r.totalTokens.input + r.totalTokens.output
  const costEstimate = (
    (r.totalTokens.input * 3) / 1_000_000 +
    (r.totalTokens.output * 15) / 1_000_000
  ).toFixed(3)

  const body = `
    <h1 style="margin:0 0 8px;font-family:'Playfair Display',serif;font-size:24px;color:#1A1A1A;">
      Pipeline SEO — Résumé
    </h1>
    <p style="margin:0 0 24px;color:#888;font-size:13px;">
      ${esc(new Date(r.endedAt).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }))}
    </p>

    <h2 style="margin:24px 0 8px;font-size:16px;color:#1A1A1A;">✓ Publiées (${r.published.length})</h2>
    ${publishedRows ? `<ul style="margin:0;padding-left:20px;color:#4a4a4a;">${publishedRows}</ul>` : '<p style="margin:0;color:#888;">Aucune.</p>'}

    ${
      r.failed.length > 0
        ? `
      <h2 style="margin:24px 0 8px;font-size:16px;color:#a94442;">⚠ Échecs (${r.failed.length})</h2>
      <ul style="margin:0;padding-left:20px;">${failedRows}</ul>
    `
        : ''
    }

    <h2 style="margin:24px 0 8px;font-size:16px;color:#1A1A1A;">Stats</h2>
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;color:#4a4a4a;">
      <tr><td style="padding:4px 16px 4px 0;">Tentées</td><td>${r.attempted.length}</td></tr>
      <tr><td style="padding:4px 16px 4px 0;">Restantes en queue</td><td>${r.remainingInQueue}</td></tr>
      <tr><td style="padding:4px 16px 4px 0;">Tokens (in/out)</td><td>${r.totalTokens.input.toLocaleString()} / ${r.totalTokens.output.toLocaleString()}</td></tr>
      <tr><td style="padding:4px 16px 4px 0;">Coût estimé</td><td>~$${costEstimate} (${tokensTotal.toLocaleString()} tokens)</td></tr>
    </table>

    <p style="margin:32px 0 0;font-size:12px;color:#888;">
      Pipeline automatique. Pour intervenir : <a href="${SITE}/studio/structure/seoState" style="color:#8B5A3A;">Studio Sanity → SEO State</a>
    </p>
  `

  return emailHtml({ title: 'SEO Pipeline — Résumé', body })
}
