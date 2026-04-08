// src/lib/auth-role.ts
// Determines if a logged-in user is an admin based on ADMIN_EMAILS env var.

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase())
  return admins.includes(email.toLowerCase())
}
