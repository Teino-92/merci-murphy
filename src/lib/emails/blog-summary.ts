// src/lib/emails/blog-summary.ts
// Emails pipeline blog auto (cron mar/jeu) : récap publication / brouillon à relire / erreur

import { btn, emailHtml, esc } from './base'
import type { BlogRunResult } from '@/lib/blog-pipeline'

const H1 = "margin:0 0 8px;font-family:'Playfair Display',serif;font-size:24px;color:#1A1A1A;"
const P = 'margin:0 0 16px;color:#4a4a4a;font-size:15px;line-height:1.6;'
const MUTED = 'margin:0 0 24px;color:#888;font-size:13px;'

function meta(r: BlogRunResult): string {
  const rows = [
    ['Sujet', r.subject],
    ['Longueur', r.wordCount ? `${r.wordCount} mots` : undefined],
    ['Réécriture', r.rewritten ? 'oui (1 passe)' : 'non'],
    [
      'Photo',
      r.image
        ? `<a href="${esc(r.image.authorUrl)}" style="color:#8B5A3A;">${esc(r.image.author)}</a> sur Unsplash`
        : 'aucune',
    ],
  ]
  return `<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;color:#4a4a4a;margin:0 0 24px;">
    ${rows
      .filter(([, v]) => v)
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 16px 4px 0;color:#888;">${k}</td><td>${k === 'Photo' ? v : esc(v)}</td></tr>`
      )
      .join('')}
  </table>`
}

function preview(r: BlogRunResult): string {
  if (!r.image) return ''
  return `<img src="${esc(r.image.previewUrl)}" alt="${esc(r.image.alt)}" width="504" style="display:block;width:100%;max-width:504px;height:auto;border-radius:12px;margin:0 0 24px;" />`
}

export function blogPublishedSubject(r: BlogRunResult): string {
  return `[Blog] Nouvel article : ${r.title ?? ''}`
}

export function blogPublishedHtml(r: BlogRunResult): string {
  const body = `
    <h1 style="${H1}">${esc(r.title)}</h1>
    <p style="${MUTED}">Publié automatiquement · ${esc(new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }))}</p>
    ${preview(r)}
    <p style="${P}">${esc(r.excerpt)}</p>
    ${meta(r)}
    ${btn("Lire l'article", r.url ?? 'https://mercimurphy.com/blog')}
    <p style="margin:0;font-size:12px;color:#888;">
      Une correction ? <a href="${esc(r.studioUrl)}" style="color:#8B5A3A;">Modifier dans le Studio</a>
    </p>
  `
  return emailHtml({ title: 'Nouvel article de blog', body })
}

export function blogDraftSubject(r: BlogRunResult): string {
  return `[Blog] Brouillon à relire : ${r.title ?? ''}`
}

export function blogDraftHtml(r: BlogRunResult): string {
  const issues = r.issues.map((i) => `<li style="margin:0 0 8px;">${esc(i)}</li>`).join('')
  const body = `
    <h1 style="${H1}">Brouillon à relire</h1>
    <p style="${MUTED}">Non publié : la relecture automatique a bloqué l'article.</p>
    <p style="${P}"><strong>${esc(r.title)}</strong></p>
    ${preview(r)}
    ${meta(r)}
    <h2 style="margin:24px 0 8px;font-size:16px;color:#a94442;">Points bloquants (${r.issues.length})</h2>
    <ul style="margin:0 0 32px;padding-left:20px;color:#4a4a4a;font-size:14px;">${issues}</ul>
    ${btn('Ouvrir le brouillon', r.studioUrl ?? 'https://mercimurphy.com/studio')}
    <p style="margin:0;font-size:12px;color:#888;">Corrige puis clique « Publish » dans le Studio. Le site se met à jour sous 1 h.</p>
  `
  return emailHtml({ title: 'Brouillon blog à relire', body })
}

export function blogErrorHtml(message: string): string {
  const body = `
    <h1 style="${H1}">Pipeline blog en erreur</h1>
    <p style="${P}">Aucun article n'a été créé.</p>
    <pre style="white-space:pre-wrap;font-size:13px;color:#a94442;background:#F5F0E8;padding:16px;border-radius:8px;">${esc(message)}</pre>
  `
  return emailHtml({ title: 'Pipeline blog en erreur', body })
}
