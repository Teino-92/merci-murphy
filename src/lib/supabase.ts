import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ─── Browser (client components) ─────────────────────────────────────────────

export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// ─── Service role (server-side only, bypasses RLS) ───────────────────────────

export function createServiceRoleClient() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// ─── Legacy export (used by newsletter action) ────────────────────────────────

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
