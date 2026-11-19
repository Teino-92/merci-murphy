import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// The proxy only runs on routes listed in `config.matcher` below.
// Every other request (public pages, assets, bots) never invokes it,
// so it costs zero Active CPU there.

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session - required for Server Components to read auth state
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtected = request.nextUrl.pathname.startsWith('/dashboard')
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  // Allow-list: only routes that read the Supabase session.
  // Server Components cannot write cookies, so these pages rely on the proxy
  // to refresh an expired access token before rendering.
  // Excluded by construction: _next/*, images, favicon, robots.txt, sitemap.xml,
  // home, /services, /toilettage/[race], /blog, /shop, /studio, /booking/respond/*,
  // /api/cron, /api/revalidate, /api/booking/respond|visit-respond.
  matcher: [
    // Protected pages
    '/dashboard/:path*',
    '/compte/:path*',
    '/reservation/:path*',
    // Auth routes (login, OAuth/email callback, password reset)
    '/login',
    '/auth/:path*',
    // API routes that call supabase.auth.getUser()
    '/api/dashboard/:path*',
    '/api/booking/available-dates',
    '/api/booking/confirm',
    '/api/booking/slots',
    '/api/booking/toiletteurs',
    '/api/push/subscribe',
    '/api/review-status',
  ],
}
