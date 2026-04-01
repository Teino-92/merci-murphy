# Roadmap – Merci Murphy Website

## Phase 0: Setup & Infrastructure

- [x] Init Next.js 14 avec TypeScript + Tailwind + shadcn/ui
- [x] Configurer ESLint, Prettier, Husky (pre-commit lint)
- [x] Setup Sanity.io (projet, dataset `production`, studio) — projectId: ge543h88
- [x] Setup Supabase (projet, tables `leads` + `newsletter_subscribers`) — SQL prêt dans project/supabase-setup.sql
- [x] Configurer .env.local avec toutes les variables d'environnement
- [x] Deploy initial sur Vercel (CI/CD depuis GitHub, page vide)
- [ ] Configurer domaine + SSL

## Phase 1: Design System & Layout

- [x] Palette Tailwind (cream, sage, terracotta, charcoal)
- [x] Fonts : Playfair Display + Inter via next/font
- [x] Composants UI de base : Button, Card, Badge, Input, Textarea, Select
- [x] Layout marketing : Navigation desktop + hamburger mobile + Footer
- [x] Composants métier : ServiceCard, TestimonialCard, TeamMemberCard
- [x] Composant Hero (image full-width + overlay + CTA)
- [x] Composant Section (wrapper padding cohérent)

## Phase 2: Sanity CMS – Schémas & Studio

- [x] Schema `service` (titre, slug, description, approche, tarifs[], faq[], image, cta)
- [x] Schema `teamMember` (nom, role, bio, photo)
- [x] Schema `testimonial` (auteur, note /5, texte, service, date)
- [x] Schema `siteSettings` (singleton : adresse, horaires, tel, email, réseaux)
- [x] GROQ queries optimisées pour chaque type (fichiers dans /sanity/queries/)
- [ ] Preview live depuis le Sanity Studio
- [x] ~~Seeder : contenu de démo pour les 5 services~~ (pas nécessaire)
- [x] Déploiement Sanity Studio sur /studio

## Phase 3: Page Accueil

- [x] Hero section (visuel fort + pitch + CTA "Réserver" / "Appeler")
- [x] Section services (6 ServiceCards avec liens)
- [x] Section valeurs & engagements (écoresponsabilité, bien-être animal)
- [x] Section témoignages (depuis Sanity, 3 cards)
- [x] Section boutique teaser (3 produits mis en avant depuis Shopify)
- [x] Section infos pratiques (adresse, horaires, Google Maps embed)
- [x] SEO : title, description, OG tags, structured data LocalBusiness

## Phase 4: Pages Services (template commun × 5)

- [x] Template `/services/[slug]` dynamique depuis Sanity
- [x] Section header service (photo + titre + accroche)
- [x] Section approche / déroulé d'un RDV (pour toilettage et crèche)
- [x] Composant Tarifs avec disclaimer "selon race/poids" (données Sanity)
- [x] Composant FAQ accordéon (questions/réponses depuis Sanity)
- [x] CTA flottant mobile (Appeler / Réserver)
- [x] SEO individualisé par service
- Pages : /services/toilettage, /services/bains, /services/creche, /services/education, /services/osteo

## Phase 5: Page Concept

- [ ] Section histoire de Merci Murphy (rich text depuis Sanity) — hardcodée pour l'instant
- [x] Section mascotte Murphy (photo + texte)
- [x] Section équipe (TeamMemberCards depuis Sanity)
- [x] Section valeurs et engagements écoresponsables

## Phase 6: Formulaires & Réservation

- [x] Page /reservation : formulaire multi-étapes (4 étapes)
  - Étape 1 : Choix du service
  - Étape 2 : Infos chien (race, poids, état du poil)
  - Étape 3 : Infos contact (nom, email, tél)
  - Étape 4 : Message libre + embed Calendly
- [x] Server Action : validation Zod + insert Supabase table `leads`
- [x] Email de confirmation client via Resend
- [x] Email de notification interne merci murphy via Resend
- [x] Page /contact : formulaire simple + Google Maps + coordonnées
- [x] Inscription newsletter (footer + pop-up au scroll 60%)
- [x] Server Action newsletter : insert Supabase table `newsletter_subscribers`

## Phase 7: E-commerce Shopify

- [x] Client Shopify Storefront API dans /lib/shopify.ts
- [x] Page /shop : grille produits avec filtres par catégorie
- [x] Catégories : petlovers / chiens / marque propre merci murphy
- [x] Page produit /shop/[category]/[slug] avec fiche détaillée
- [x] Composant AddToCart (redirige vers Shopify checkout natif)
- [x] Revalidation ISR via webhook Shopify (mise à jour stock/prix auto)
- [ ] Mise en avant produits marque propre sur la page Accueil

## Phase 8: SEO, Performance & Analytics

- [x] Sitemap.xml dynamique (routes statiques + slugs Sanity + produits Shopify)
- [x] robots.txt
- [x] Metadata dynamiques sur toutes les pages (via generateMetadata)
- [x] OpenGraph images statiques par type de page (/public/og/)
- [x] Audit et fix images : next/image + blur placeholder partout
- [x] Score Lighthouse > 90 sur Accueil, Toilettage, Shop
- [x] Intégration Plausible (script dans layout.tsx)
- [x] Pages légales : Mentions légales + Politique de confidentialité (statiques)

## Phase 9: QA & Polish

- [ ] Tests cross-browser : Chrome, Safari, Firefox, Edge
- [ ] Tests mobile : iOS Safari, Android Chrome
- [ ] Vérification tous les formulaires en production
- [ ] Test tunnel Shopify complet (ajout panier → checkout)
- [ ] Vérification SEO (crawl Screaming Frog, structured data validator)
- [ ] Redirects 301 depuis l'ancien site
- [ ] README.md : guide de mise à jour Sanity pour l'équipe merci murphy

## Phase 10.5: Blog Sanity

- [x] Schema Sanity `post` (titre, slug, coverImage, category, excerpt, body, publishedAt, readingTime)
- [x] GROQ queries : `getAllPosts`, `getPostBySlug`, `getRelatedPosts`, `getPublishedPostCount`
- [x] Composant `PostCard` (3 variantes : `featured`, `secondary`, `compact`)
- [x] Page listing `/blog` — layout 2 colonnes asymétrique éditorial
- [x] Page article `/blog/[slug]` — centré + "À lire aussi" (≥2 articles)
- [x] Lien "Blog" dans la nav — visible uniquement si ≥1 article publié

## Phase 10: Mise en production

- [ ] Cutover DNS vers Vercel
- [ ] Monitoring Vercel (alertes erreurs)
- [ ] Vérification Plausible actif en prod
- [ ] Briefing équipe merci murphy : CMS, formulaires, Shopify

---

## Open Questions

- URL exacte de l'eshop Shopify existant : https://mercimurphy.myshopify.com/
- Calendly déjà créé ? Si oui, URL de l'événement ?
- Photos/vidéos disponibles pour le hero ? (sinon placeholder)
- Domaine final : mercimurphy.com
- Adresse email pour les notifications internes bonjour@mercimurphy.com

## Notes

- V1 : pas de validation en ligne ni d'empreinte bancaire pour les RDV
- Les tarifs sont indicatifs sur le site, l'équipe rappelle pour confirmer
- Calendly uniquement pour les bains (self-service) en V1
