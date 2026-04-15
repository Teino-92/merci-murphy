// src/lib/emails/base.ts
// Shared HTML email layout — dark navy header, cream background

/** Escape user-supplied strings before inserting into HTML email bodies. */
export function esc(str: string | null | undefined): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const NAVY = '#1D164E'
const TERRACOTTA = '#8B5A3A'
const CREAM = '#F5F0E8'
const TEXT = '#4a4a4a'
const MUTED = '#888888'

// ─── Layout ───────────────────────────────────────────────────────────────────

export function emailHtml(params: { title: string; body: string }): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${params.title}</title></head>
<body style="margin:0;padding:0;background:${CREAM};font-family:Inter,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:48px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="padding:40px 48px;background:${NAVY};text-align:center;">
  <p style="margin:0;color:${CREAM};font-size:22px;font-weight:600;letter-spacing:0.02em;">merci murphy®</p>
</td></tr>
<tr><td style="padding:40px 48px;">
${params.body}
</td></tr>
<tr><td style="padding:24px 48px;background:${CREAM};text-align:center;">
  <p style="margin:0;font-size:12px;color:${MUTED};">merci murphy® · 18 rue Victor Massé, 75009 Paris · bonjour@mercimurphy.com</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
}

// ─── Components ───────────────────────────────────────────────────────────────

/** CTA button */
export function btn(label: string, url: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
  <tr><td align="center">
    <a href="${url}" style="display:inline-block;background:${TERRACOTTA};color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:100px;">
      ${label}
    </a>
  </td></tr>
</table>`
}

/** Paragraph */
export function p(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:${TEXT};line-height:1.6;">${text}</p>`
}

/** Horizontal divider */
export function divider(): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td style="border-top:1px solid #e8e3dc;font-size:0;line-height:0;">&nbsp;</td></tr>
</table>`
}

/** Bullet list — pass an array of strings (may contain HTML) */
export function ul(items: string[]): string {
  const rows = items
    .map(
      (item) =>
        `<tr>
      <td valign="top" style="padding:0 0 8px 0;width:20px;font-size:15px;color:${TERRACOTTA};line-height:1.6;">•</td>
      <td valign="top" style="padding:0 0 8px 8px;font-size:15px;color:${TEXT};line-height:1.6;">${item}</td>
    </tr>`
    )
    .join('\n')
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
  ${rows}
</table>`
}

/** Single bullet point (standalone, e.g. address line) */
export function bullet(text: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
  <tr>
    <td valign="top" style="width:20px;font-size:15px;color:${TERRACOTTA};line-height:1.6;">•</td>
    <td valign="top" style="padding-left:8px;font-size:15px;color:${TEXT};line-height:1.6;">${text}</td>
  </tr>
</table>`
}
