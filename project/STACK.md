# Tech Stack

## Frontend

- Next.js 14 (App Router — pas Pages Router)
- TypeScript strict
- Tailwind CSS
- shadcn/ui (composants primitifs)

## CMS

- Sanity.io (contenu éditorial : services, tarifs, FAQ, équipe, témoignages)
- Studio déployé sur /studio

## E-commerce

- Shopify Storefront API (catalogue, panier, checkout)
- Le checkout reste sur Shopify natif — on n'y touche pas

## Base de données

- Supabase (leads, newsletter subscribers)
- Pas d'ORM — requêtes directes via @supabase/ssr

## Emails transactionnels

- Resend (confirmation de demande de RDV, notification interne)

## Réservations

- Calendly (embed iframe) — V1 : prise d'infos uniquement, pas de validation en ligne

## Analytics

- Plausible Analytics (RGPD compliant, no cookie banner)

## Hosting

- Vercel (deploy auto depuis GitHub, CDN mondial)

## Fonts

- Playfair Display (titres) — Google Fonts
- Inter (corps de texte) — Google Fonts

## Palette de couleurs (Tailwind config)

- cream: #F5F0E8
- terracotta: #C4845A
- charcoal: #1A1A1A
- rose: #FFDAD4
- bleu: #1D164E

---

**Ces choix sont finaux. Ne pas suggérer d'alternatives.**
