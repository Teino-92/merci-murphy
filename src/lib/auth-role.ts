// src/lib/auth-role.ts
// Determines dashboard access roles based on env vars.
// ADMIN_EMAILS  — full access (Vue d'ensemble, financials, all API routes)
// TEAM_EMAILS   — restricted access (Calendrier, Clients, Demandes only)

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase())
  return admins.includes(email.toLowerCase())
}

export function hasDashboardAccess(email: string | undefined): boolean {
  if (!email) return false
  const team = (process.env.TEAM_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase())
  return isAdminEmail(email) || team.includes(email.toLowerCase())
}
