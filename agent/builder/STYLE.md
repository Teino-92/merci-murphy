## CODE STYLE

- TypeScript strict mode (no `any`)
- Functional components only (React)
- Descriptive variable names
- No comments unless logic is genuinely complex
- Prefer early returns over nested ifs
- Async/await over .then()

## FILE NAMING

- kebab-case for files and folders: `service-card.tsx`, `shopify-client.ts`
- PascalCase for React components: `ServiceCard`, `HeroSection`
- UPPERCASE for config/env constants: `SITE_CONFIG`, `SHOPIFY_DOMAIN`

## FOLDER STRUCTURE

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

## IMPORTS

- Group: external libs → internal @/ → relative ./
- Always use absolute imports with @/ alias
- Never use relative ../../ more than one level deep
