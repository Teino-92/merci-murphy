# Checkout Auth Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require a Merci Murphy account before allowing the user to proceed to Shopify checkout — unauthenticated users are redirected to login/signup, then bounced back to checkout automatically.

**Architecture:** The "Passer la commande" button in `CartDrawer` becomes a handler that checks Supabase auth client-side. If logged in, it navigates to `cart.checkoutUrl` directly. If not, it saves the Shopify checkout URL to `localStorage` under the key `mm-pending-checkout` and redirects to `/compte/connexion?redirect=checkout`. After a successful login, `SignInForm` detects `redirect=checkout`, reads the URL from `localStorage`, clears it, and navigates there. The inscription page gets the same treatment so new signups also land on checkout.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Supabase browser client (`createSupabaseBrowserClient`), `localStorage`, `useRouter` (Next.js)

---

## Files touched

| File                                              | Change                                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/components/shop/cart-drawer.tsx`             | Replace `<a href={checkoutUrl}>` with a `<button>` that checks auth before navigating |
| `src/components/forms/signin-form.tsx`            | After login, detect `redirect=checkout`, read `localStorage`, navigate to Shopify URL |
| `src/components/forms/signup-form.tsx`            | After signup success, same checkout redirect logic                                    |
| `src/app/(marketing)/compte/inscription/page.tsx` | Pass `redirectTo` search param down to `SignUpForm`                                   |

---

## Task 1: Auth-gated checkout button in CartDrawer

**Files:**

- Modify: `src/components/shop/cart-drawer.tsx:127-132`

The current checkout link is a plain `<a>` tag that always navigates to `cart.checkoutUrl`. Replace it with a `<button>` that:

1. Calls `createSupabaseBrowserClient().auth.getUser()`
2. If authenticated → `window.location.href = checkoutUrl`
3. If not → saves `checkoutUrl` to `localStorage` under `'mm-pending-checkout'`, then `router.push('/compte/connexion?redirect=checkout')`

- [ ] **Step 1: Add `useRouter` import and `handleCheckout` function**

Replace the bottom section of `CartDrawer` (the `{/* Footer */}` block). Full file after change:

```tsx
'use client'

import Image from 'next/image'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/cart-context'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/shopify'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export function CartDrawer() {
  const { cart, isOpen, isLoading, closeCart, removeItem, updateItem } = useCart()
  const router = useRouter()

  const lines = cart?.lines ?? []
  const isEmpty = lines.length === 0

  async function handleCheckout() {
    if (!cart?.checkoutUrl) return
    const supabase = createSupabaseBrowserClient()
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      window.location.href = cart.checkoutUrl
    } else {
      localStorage.setItem('mm-pending-checkout', cart.checkoutUrl)
      router.push('/compte/connexion?redirect=checkout')
      closeCart()
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={closeCart} />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-4">
          <h2 className="font-display text-xl font-bold text-charcoal">Mon panier</h2>
          <button
            onClick={closeCart}
            className="rounded-full p-1.5 text-charcoal/50 hover:bg-charcoal/10 hover:text-charcoal transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="h-16 w-16 text-charcoal/20" />
            <p className="text-charcoal/50">Votre panier est vide.</p>
            <Button
              onClick={closeCart}
              variant="outline"
              className="border-terracotta-dark text-terracotta-dark hover:bg-terracotta-dark hover:text-white"
            >
              Continuer mes achats
            </Button>
          </div>
        ) : (
          <>
            {/* Lines */}
            <ul className="flex-1 overflow-y-auto divide-y divide-charcoal/10 px-6">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-4 py-5">
                  {/* Image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-rose/20">
                    {line.image && (
                      <Image
                        src={line.image.url}
                        alt={line.image.altText ?? line.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col">
                    <p className="font-medium text-charcoal leading-snug">{line.title}</p>
                    {line.variantTitle !== 'Default Title' && (
                      <p className="mt-0.5 text-sm text-charcoal/50">{line.variantTitle}</p>
                    )}
                    <p className="mt-1 font-semibold text-terracotta-dark">
                      {formatPrice(line.price)}
                    </p>

                    {/* Qty controls */}
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() =>
                          line.quantity > 1
                            ? updateItem(line.id, line.quantity - 1)
                            : removeItem(line.id)
                        }
                        disabled={isLoading}
                        className="rounded-full border border-charcoal/20 p-1 text-charcoal hover:border-terracotta-dark hover:text-terracotta-dark transition-colors disabled:opacity-40"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm font-medium">{line.quantity}</span>
                      <button
                        onClick={() => updateItem(line.id, line.quantity + 1)}
                        disabled={isLoading}
                        className="rounded-full border border-charcoal/20 p-1 text-charcoal hover:border-terracotta-dark hover:text-terracotta-dark transition-colors disabled:opacity-40"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => removeItem(line.id)}
                        disabled={isLoading}
                        className="ml-auto text-charcoal/30 hover:text-red-500 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="border-t border-charcoal/10 px-6 py-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-charcoal/70">Total</span>
                <span className="text-xl font-bold text-charcoal">
                  {cart?.totalAmount && formatPrice(cart.totalAmount)}
                </span>
              </div>
              <p className="text-xs text-charcoal/40 text-center">
                Frais de livraison calculés à la commande
              </p>
              <button
                onClick={handleCheckout}
                className="block w-full rounded-xl bg-terracotta-dark py-3.5 text-center font-semibold text-white transition-colors hover:bg-terracotta-dark/90"
              >
                Passer la commande
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: `✓ Generating static pages` with no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/shop/cart-drawer.tsx
git commit -m "feat: gate checkout behind Merci Murphy auth"
```

---

## Task 2: Redirect to Shopify checkout after login

**Files:**

- Modify: `src/components/forms/signin-form.tsx:27`

After a successful sign-in, check if `redirectTo === 'checkout'`. If so, read `localStorage.getItem('mm-pending-checkout')`, clear it, and navigate to that URL via `window.location.href`. For every other `redirectTo` value, keep the existing `router.push(redirectTo)` behaviour.

- [ ] **Step 1: Update `handleSubmit` success branch in `SignInForm`**

Replace the `else` block (lines 26-28) with:

```tsx
} else {
  if (redirectTo === 'checkout') {
    const pendingUrl = localStorage.getItem('mm-pending-checkout')
    localStorage.removeItem('mm-pending-checkout')
    window.location.href = pendingUrl ?? '/shop'
  } else {
    router.push(redirectTo)
  }
}
```

Full `handleSubmit` after change:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError(null)
  const supabase = createSupabaseBrowserClient()
  const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
  setLoading(false)
  if (authError) {
    setError('Email ou mot de passe incorrect.')
  } else {
    if (redirectTo === 'checkout') {
      const pendingUrl = localStorage.getItem('mm-pending-checkout')
      localStorage.removeItem('mm-pending-checkout')
      window.location.href = pendingUrl ?? '/shop'
    } else {
      router.push(redirectTo)
    }
  }
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: `✓ Generating static pages` with no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/forms/signin-form.tsx
git commit -m "feat: redirect to pending Shopify checkout after login"
```

---

## Task 3: Redirect to Shopify checkout after signup

**Files:**

- Modify: `src/app/(marketing)/compte/inscription/page.tsx`
- Modify: `src/components/forms/signup-form.tsx`

New signups should also land on checkout if they came from the cart gate. The inscription page already reads `searchParams.redirect` — it just needs to pass it into `SignUpForm`. `SignUpForm` currently shows a success screen (`done = true`) and doesn't navigate anywhere. We need to add post-signup navigation: if `redirectTo === 'checkout'`, read `localStorage` and go there after the success screen (or skip the success screen entirely and navigate immediately).

### 3a — Pass `redirectTo` to `SignUpForm`

- [ ] **Step 1: Update `InscriptionPage` to accept and forward `redirect` param**

In `src/app/(marketing)/compte/inscription/page.tsx`, change `SignUpForm` call from:

```tsx
<SignUpForm />
```

to:

```tsx
<SignUpForm redirectTo={searchParams.redirect ?? '/compte'} />
```

Full file after change:

```tsx
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Section, Container } from '@/components/ui/section'
import { SignUpForm } from '@/components/forms/signup-form'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Créer un compte',
  description:
    'Créez votre compte merci murphy® pour gérer les informations de votre chien et faciliter vos réservations.',
}

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user)
    redirect(
      searchParams.redirect === 'checkout' ? '/shop' : (searchParams.redirect ?? '/reservation')
    )

  return (
    <>
      <div style={{ backgroundColor: '#B5A89A' }}>
        <Section className="text-charcoal py-20">
          <Container className="max-w-2xl text-center">
            <h1 className="font-display text-4xl font-bold sm:text-6xl">Créer un compte</h1>
            <p className="mt-4 text-lg text-charcoal/60">
              Enregistrez les informations de votre chien pour simplifier vos prises de rendez-vous.
            </p>
          </Container>
        </Section>
      </div>
      <Section className="bg-cream">
        <Container className="max-w-xl">
          <SignUpForm redirectTo={searchParams.redirect ?? '/compte'} />
        </Container>
      </Section>
    </>
  )
}
```

### 3b — Handle checkout redirect in `SignUpForm`

- [ ] **Step 2: Add `redirectTo` prop to `SignUpForm` and navigate after success**

`SignUpForm` currently ends in a `done` state showing a success message with no navigation. Add a `redirectTo` prop and a `useEffect` that navigates when `done` becomes `true`.

At the top of `signup-form.tsx`, add:

```tsx
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
```

Change the component signature from:

```tsx
export function SignUpForm() {
```

to:

```tsx
export function SignUpForm({ redirectTo = '/compte' }: { redirectTo?: string }) {
```

Add inside the component body, after the existing state declarations:

```tsx
const router = useRouter()

useEffect(() => {
  if (!done) return
  if (redirectTo === 'checkout') {
    const pendingUrl = localStorage.getItem('mm-pending-checkout')
    localStorage.removeItem('mm-pending-checkout')
    // Small delay so the user sees the success message briefly
    const t = setTimeout(() => {
      window.location.href = pendingUrl ?? '/shop'
    }, 1500)
    return () => clearTimeout(t)
  }
}, [done, redirectTo, router])
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: `✓ Generating static pages` with no type errors.

- [ ] **Step 4: Commit**

```bash
git add 'src/app/(marketing)/compte/inscription/page.tsx' src/components/forms/signup-form.tsx
git commit -m "feat: redirect new signups to pending Shopify checkout"
```

---

## Manual test checklist (no automated tests — this is a browser-only auth + external URL flow)

After implementing all three tasks, verify end-to-end in the browser on `localhost:3000`:

- [ ] **Logged-out user, cart with items:** Click "Passer la commande" → cart closes → redirected to `/compte/connexion?redirect=checkout` → log in → redirected to Shopify checkout URL (not `/compte`)
- [ ] **Logged-out user, new account:** Click "Passer la commande" → redirected to connexion page → click "Créer un compte" → `?redirect=checkout` is preserved in the URL → complete signup → success screen shows briefly → redirected to Shopify checkout URL
- [ ] **Logged-in user, cart with items:** Click "Passer la commande" → navigated directly to Shopify checkout URL without any redirect
- [ ] **Edge case — `localStorage` cleared between sessions:** If `mm-pending-checkout` is missing, user lands on `/shop` instead of crashing
- [ ] **Already logged in when hitting `/compte/connexion?redirect=checkout`:** The connexion page server-side redirect (line `if (user) redirect(...)`) currently redirects to `searchParams.redirect`. Since `redirect=checkout` is a string, not a path, this would send the user to a 404 at `/checkout`. Fix: in `connexion/page.tsx`, add a guard so that if `searchParams.redirect === 'checkout'` the server-side redirect goes to `/shop` instead. Update line 21:

```tsx
if (user) {
  if (searchParams.redirect === 'checkout') {
    // Can't redirect server-side to Shopify URL — send to shop, user re-initiates
    redirect('/shop')
  }
  redirect(searchParams.redirect ?? '/compte')
}
```

> **Note:** This edge case (already logged in but hitting the connexion page with `redirect=checkout`) is unusual — it only happens if the user manually navigates there. The `handleCheckout` function in the drawer already skips the redirect for logged-in users, so this is a belt-and-suspenders fix.

- [ ] **Commit edge case fix:**

```bash
git add 'src/app/(marketing)/compte/connexion/page.tsx'
git commit -m "fix: handle redirect=checkout on connexion page for already-logged-in users"
```
