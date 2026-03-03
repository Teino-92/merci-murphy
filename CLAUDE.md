# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Merci Murphy — website redesign for a premium dog wellness boutique in Paris. The site serves as brand showcase, booking funnel, and e-commerce storefront.

## Agent Modes

This repo uses two distinct agent modes. Load the corresponding file at the start of each session:

- **Builder** (`AGENT.builder.md`): For executing tasks. Reads `project/ROADMAP.md`, implements tasks in order, marks them DONE, asks before starting a new phase.
- **Thinker** (`AGENT.thinker.md`): For discussion and exploration only. No production code, no task execution.

## Tech Stack

Stack choices are final — do not suggest alternatives (see `project/STACK.md`).

- **Framework**: Next.js 14 App Router, TypeScript strict
- **Styling**: Tailwind CSS with custom palette (`cream`, `sage`, `terracotta`, `charcoal`), shadcn/ui primitives
- **CMS**: Sanity.io — editorial content (services, pricing, FAQ, team, testimonials); Studio at `/studio`
- **E-commerce**: Shopify Storefront API (read-only); checkout stays on native Shopify
- **Database**: Supabase — `leads` and `newsletter_subscribers` tables, direct queries via `@supabase/ssr`, no ORM
- **Email**: Resend (booking confirmations + internal notifications)
- **Booking**: Calendly embed (baths only in V1; all other services use custom form)
- **Analytics**: Plausible (RGPD-compliant, no cookie banner)
- **Hosting**: Vercel (auto-deploy from GitHub)
- **Fonts**: Playfair Display (headings) + Inter (body) via `next/font`

## Commands

The project is not yet initialized. Once the Next.js app is scaffolded (Phase 0):

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

## Folder Structure (target)

```
/app
  /(marketing)        → public pages (nav + footer layout)
  /(shop)             → e-commerce pages
/components
  /ui                 → shadcn/ui + custom primitives
  /sections           → full-width page sections
  /forms              → form components
/sanity
  /schemas            → Sanity content types
  /queries            → GROQ query functions
/lib
  /shopify.ts         → Storefront API client
  /supabase.ts        → Supabase client
  /utils.ts           → shared utilities
/config
  /site.ts            → SEO defaults, nav, metadata
/types                → global TypeScript types
```

## Code Rules

- Server Components by default; Client Components only when interactivity/hooks are required
- Validate all form inputs with Zod; use Server Actions for form submissions
- Use `next/image` for all images — never raw `<img>`
- No `any` in TypeScript — strict mode enforced
- No `console.log` in production code
- Prefer early returns over nested conditionals
- Async/await over `.then()`
- Functional React components only

## File Naming

- `kebab-case` for files and folders: `service-card.tsx`, `shopify-client.ts`
- `PascalCase` for React component names: `ServiceCard`, `HeroSection`
- `UPPERCASE` for config/env constants: `SITE_CONFIG`, `SHOPIFY_DOMAIN`

## Imports

- Group order: external libs → internal `@/` → relative `./`
- Always use absolute imports with `@/` alias
- Never use relative `../../` more than one level deep

## Data Model

**Supabase:**

- `leads`: booking requests (service, dog info, contact, status lifecycle: `new → contacted → confirmed → cancelled`)
- `newsletter_subscribers`: email + active flag
- RLS: public INSERT via anon key; SELECT/UPDATE via service role only

**Sanity schemas:** `service`, `teamMember`, `testimonial`, `siteSettings` (singleton)

**Shopify:** Products and collections accessed read-only via Storefront API. Checkout is a redirect to native Shopify — never replicate it.

## Required Environment Variables

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=

NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=
SHOPIFY_STOREFRONT_ACCESS_TOKEN=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_INTERNAL_EMAIL=

NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
NEXT_PUBLIC_CALENDLY_URL=
```

## Source of Truth Files

Always read before starting work:

- `project/ROADMAP.md` — current task status and phases
- `project/SCOPE.md` — what is and isn't in V1
- `project/DISCOVERY/DATA_MODEL.md` — Supabase tables and Sanity schemas
- `project/DISCOVERY/DECISIONS.md` — rationale for key technical choices
