# Performance — Option A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce perceived load time by serving smaller images (AVIF/WebP), eliminating above-the-fold invisible content on navigation, and adding CDN preconnect hints.

**Architecture:** Four targeted changes — next.config image formats + cache TTL, preconnect hints in root layout, font display swap, and unwrapping `<Reveal>` from above-the-fold hero/page-header content only. Below-fold Reveal animations are untouched.

**Tech Stack:** Next.js 14, Framer Motion, next/font/google, Tailwind CSS

---

### Task 1: Image format + cache TTL in next.config.mjs

**Files:**

- Modify: `next.config.mjs`

- [ ] **Step 1: Update next.config.mjs**

Replace the current config with:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'behold.pictures' },
      { protocol: 'https', hostname: 'cdn2.behold.pictures' },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with no errors.

- [ ] **Step 3: Commit**

```bash
git add next.config.mjs
git commit -m "perf: serve AVIF/WebP images with 1-year cache TTL"
```

---

### Task 2: Preconnect hints + font display swap in root layout

**Files:**

- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add display: 'swap' to both fonts and preconnect links**

In `src/app/layout.tsx`, update the font declarations and `<head>`:

```tsx
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})
```

And inside `<head>`, add preconnect before the Plausible scripts:

```tsx
<head>
  <link rel="preconnect" href="https://cdn.sanity.io" />
  <link rel="preconnect" href="https://cdn.shopify.com" />
  <link rel="dns-prefetch" href="https://feeds.behold.so" />
  <script async src="https://plausible.io/js/pa-PYgdr6VtQ4YY6wh9emEkQ.js" />
  <script
    dangerouslySetInnerHTML={{
      __html: `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`,
    }}
  />
</head>
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "perf: add preconnect hints for Sanity/Shopify CDNs + font display swap"
```

---

### Task 3: Unwrap Reveal from above-the-fold page headers

These are the `<Reveal>` wrappers that sit over the hero/header of each page — content that is immediately visible on navigation and should never start at `opacity: 0`. Below-fold Reveal usage is not touched.

**Files:**

- Modify: `src/app/(marketing)/concept/page.tsx`
- Modify: `src/app/(marketing)/contact/page.tsx`
- Modify: `src/app/(marketing)/services/page.tsx`
- Modify: `src/app/(marketing)/services/[slug]/page.tsx`
- Modify: `src/app/(shop)/shop/page.tsx`

#### 3a — concept/page.tsx

- [ ] **Step 1: Remove Reveal from the hero text block**

In `src/app/(marketing)/concept/page.tsx` around line 38, change:

```tsx
<div className="absolute bottom-0 left-0 px-8 pb-10 sm:px-14 sm:pb-14 max-w-2xl">
  <Reveal>
    <p className="text-xs font-semibold uppercase tracking-widest text-terracotta mb-3">
      Paris, France
    </p>
    <h1 className="font-display text-4xl font-bold text-cream sm:text-6xl leading-tight drop-shadow-sm">
      merci murphy®
    </h1>
    <p className="mt-4 text-base leading-relaxed text-cream/80 sm:text-lg max-w-md drop-shadow-sm">
      ambassadeur d&apos;un art de vivre partagé entre l&apos;humain et son animal.
    </p>
  </Reveal>
</div>
```

To (just remove the `<Reveal>` wrapper, keep children):

```tsx
<div className="absolute bottom-0 left-0 px-8 pb-10 sm:px-14 sm:pb-14 max-w-2xl">
  <p className="text-xs font-semibold uppercase tracking-widest text-terracotta mb-3">
    Paris, France
  </p>
  <h1 className="font-display text-4xl font-bold text-cream sm:text-6xl leading-tight drop-shadow-sm">
    merci murphy®
  </h1>
  <p className="mt-4 text-base leading-relaxed text-cream/80 sm:text-lg max-w-md drop-shadow-sm">
    ambassadeur d&apos;un art de vivre partagé entre l&apos;humain et son animal.
  </p>
</div>
```

#### 3b — contact/page.tsx

- [ ] **Step 2: Remove Reveal from the contact hero text block**

In `src/app/(marketing)/contact/page.tsx` around line 37, change:

```tsx
<div className="absolute bottom-0 left-0 px-8 pb-10 sm:px-14 sm:pb-14 max-w-2xl">
  <Reveal>
    <h1 className="font-display text-4xl font-bold text-cream sm:text-6xl drop-shadow-sm">
      Contact
    </h1>
    <p className="mt-4 text-base leading-relaxed text-cream/80 sm:text-lg drop-shadow-sm">
      Une question ? N&apos;hésitez pas à nous écrire ou nous appeler.
    </p>
  </Reveal>
</div>
```

To:

```tsx
<div className="absolute bottom-0 left-0 px-8 pb-10 sm:px-14 sm:pb-14 max-w-2xl">
  <h1 className="font-display text-4xl font-bold text-cream sm:text-6xl drop-shadow-sm">Contact</h1>
  <p className="mt-4 text-base leading-relaxed text-cream/80 sm:text-lg drop-shadow-sm">
    Une question ? N&apos;hésitez pas à nous écrire ou nous appeler.
  </p>
</div>
```

#### 3c — services/page.tsx

- [ ] **Step 3: Remove Reveal from the services index hero text block**

In `src/app/(marketing)/services/page.tsx` around line 33, change:

```tsx
<div className="absolute bottom-0 left-0 px-8 pb-10 sm:px-14 sm:pb-14 max-w-2xl">
  <Reveal>
    <h1 className="font-display text-4xl font-bold text-cream sm:text-6xl drop-shadow-sm">
      Nos services
    </h1>
    <p className="mt-4 text-base leading-relaxed text-cream/80 sm:text-lg drop-shadow-sm">
      Toute l&apos;attention et l&apos;expertise que votre chien mérite, dans un lieu unique.
    </p>
  </Reveal>
</div>
```

To:

```tsx
<div className="absolute bottom-0 left-0 px-8 pb-10 sm:px-14 sm:pb-14 max-w-2xl">
  <h1 className="font-display text-4xl font-bold text-cream sm:text-6xl drop-shadow-sm">
    Nos services
  </h1>
  <p className="mt-4 text-base leading-relaxed text-cream/80 sm:text-lg drop-shadow-sm">
    Toute l&apos;attention et l&apos;expertise que votre chien mérite, dans un lieu unique.
  </p>
</div>
```

#### 3d — services/[slug]/page.tsx

- [ ] **Step 4: Remove Reveal from service detail page header**

The service `[slug]` page header is a plain `<div>` (not using `<Reveal>`), so no change needed here — the `<Reveal>` wrappers in this file are all below the fold (Approche, Déroulé, Tarifs, FAQ, CTA sections). Skip this file.

#### 3e — shop/page.tsx

- [ ] **Step 5: Remove Reveal from shop page hero content**

In `src/app/(shop)/shop/page.tsx` around lines 26 and 39, change:

```tsx
              <Reveal className="hidden lg:block lg:order-2 lg:self-stretch">
                <div className="relative w-full h-full min-h-[600px] overflow-hidden rounded-2xl">
                  <Image
                    src="/boutique-hero.jpg"
                    alt="La boutique merci murphy®"
                    fill
                    className="object-cover object-center"
                    sizes="33vw"
                  />
                </div>
              </Reveal>

              <Reveal className="text-center lg:text-left lg:order-1">
                <h1 className="mt-3 font-display text-4xl font-bold sm:text-6xl">
                  Boutique éthique & éco-responsable pour chiens et chats
                </h1>
                <h2 className="mt-2 text-sm font-medium uppercase tracking-widest text-terracotta-dark">
                  Une seule planète
                </h2>
                <p className="mt-3 text-charcoal/50 text-sm">
                  merci murphy®, c&apos;est aussi un dog shop engagé. Nos achats ont un sens — pour
                  nos poilus et pour la planète.
                </p>
```

To (unwrap Reveal, keep the className on the inner div):

```tsx
              <div className="hidden lg:block lg:order-2 lg:self-stretch">
                <div className="relative w-full h-full min-h-[600px] overflow-hidden rounded-2xl">
                  <Image
                    src="/boutique-hero.jpg"
                    alt="La boutique merci murphy®"
                    fill
                    className="object-cover object-center"
                    sizes="33vw"
                  />
                </div>
              </div>

              <div className="text-center lg:text-left lg:order-1">
                <h1 className="mt-3 font-display text-4xl font-bold sm:text-6xl">
                  Boutique éthique & éco-responsable pour chiens et chats
                </h1>
                <h2 className="mt-2 text-sm font-medium uppercase tracking-widest text-terracotta-dark">
                  Une seule planète
                </h2>
                <p className="mt-3 text-charcoal/50 text-sm">
                  merci murphy®, c&apos;est aussi un dog shop engagé. Nos achats ont un sens — pour
                  nos poilus et pour la planète.
                </p>
```

- [ ] **Step 6: Verify build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with no errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/(marketing)/concept/page.tsx src/app/(marketing)/contact/page.tsx src/app/(marketing)/services/page.tsx "src/app/(shop)/shop/page.tsx"
git commit -m "perf: unwrap Reveal from above-the-fold page headers — content now immediately visible on navigation"
```

---

### Task 4: Push

- [ ] **Step 1: Push all commits**

```bash
git push
```

Expected: all 3 commits pushed to `main`.
