# Merci Murphy – Website

Site web de merci murphy, boutique premium de bien-être pour chiens à Paris.

## Stack

Next.js 14 · TypeScript · Tailwind CSS · Sanity.io · Shopify · Supabase · Vercel

## Lancer Claude Code

### Mode Builder (exécution)

```
Load AGENT.builder.md and execute accordingly
```

### Mode Thinker (discussion)

```
Load AGENT.thinker.md
```

## Structure

```
merci-murphy/
├── AGENT.builder.md          # Mode exécution
├── AGENT.thinker.md          # Mode discussion
├── agent/
│   ├── builder/              # CORE, RULES, STYLE pour le builder
│   └── thinker/              # CORE, STYLE pour le thinker
└── project/
    ├── GOALS.md              # Objectifs & KPIs
    ├── SCOPE.md              # In / out of scope
    ├── STACK.md              # Choix techniques (finaux)
    ├── ROADMAP.md            # Phases & tâches (mise à jour par l'agent)
    └── DISCOVERY/
        ├── CONTEXT.md        # Contexte marque, services, concurrents
        ├── DATA_MODEL.md     # Supabase tables + Sanity schemas
        ├── USER_STORIES.md   # User stories par epic
        └── DECISIONS.md      # Log des décisions techniques

```

## Variables d'environnement requises

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

## Liens

- Website actuel : https://www.mercimurphy.com
- Eshop : https://shop.mercimurphy.com
- Instagram : https://www.instagram.com/mercimurphy/
