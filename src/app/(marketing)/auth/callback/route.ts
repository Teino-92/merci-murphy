import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { finalizeSignup } from '@/lib/signup-finalize'

function safeNext(raw: string | null): string {
  if (!raw) return '/'
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return '/'
  return raw
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'recovery' | 'email' | 'signup' | null
  const next = safeNext(searchParams.get('next'))

  const supabase = await createSupabaseServerClient()

  let authError: unknown = null
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    authError = error
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    authError = error
  }

  if (authError) {
    return NextResponse.redirect(new URL('/compte/connexion?error=auth', origin))
  }

  // First confirmation of a self-service signup: create profile + dog now
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) await finalizeSignup(user)

  return NextResponse.redirect(new URL(next, origin))
}
