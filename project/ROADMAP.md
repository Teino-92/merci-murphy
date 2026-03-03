# Roadmap – Merci Murphy Website

## Phase 0: Setup & Infrastructure

- [x] Init Next.js 14 avec TypeScript + Tailwind + shadcn/ui
- [x] Configurer ESLint, Prettier, Husky (pre-commit lint)
- [x] Setup Sanity.io (projet, dataset `production`, studio) — projectId: ge543h88
- [ ] Setup Supabase (projet, tables `leads` + `newsletter_subscribers`) — SQL prêt dans project/supabase-setup.sql
- [x] Configurer .env.local avec toutes les variables d'environnement
- [ ] Deploy initial sur Vercel (CI/CD depuis GitHub, page vide)
- [ ] Configurer domaine + SSL

## Phase 1: Design System & Layout

- [ ] Palette Tailwind (cream, sage, terracotta, charcoal)
- [ ] Fonts : Playfair Display + Inter via next/font
- [ ] Composants UI de base : Button, Card, Badge, Input, Textarea, Select
- [ ] Layout marketing : Navigation desktop + hamburger mobile + Footer
- [ ] Composants métier : ServiceCard, TestimonialCard, TeamMemberCard
- [ ] Composant Hero (image full-width + overlay + CTA)
- [ ] Composant Section (wrapper padding cohérent)

## Phase 2: Sanity CMS – Schémas & Studio

- [ ] Schema `service` (titre, slug, description, approche, tarifs[], faq[], image, cta)
- [ ] Schema `teamMember` (nom, role, bio, photo)
- [ ] Schema `testimonial` (auteur, note /5, texte, service, date)
- [ ] Schema `siteSettings` (singleton : adresse, horaires, tel, email, réseaux)
- [ ] GROQ queries optimisées pour chaque type (fichiers dans /sanity/queries/)
- [ ] Preview live depuis le Sanity Studio
- [ ] Seeder : contenu de démo pour les 5 services
- [ ] Déploiement Sanity Studio sur /studio

## Phase 3: Page Accueil

- [ ] Hero section (visuel fort + pitch + CTA "Réserver" / "Appeler")
- [ ] Section services (6 ServiceCards avec liens)
- [ ] Section valeurs & engagements (écoresponsabilité, bien-être animal)
- [ ] Section témoignages (depuis Sanity, 3 cards)
- [ ] Section boutique teaser (3 produits mis en avant depuis Shopify)
- [ ] Section infos pratiques (adresse, horaires, Google Maps embed)
- [ ] SEO : title, description, OG tags, structured data LocalBusiness

## Phase 4: Pages Services (template commun × 5)

- [ ] Template `/services/[slug]` dynamique depuis Sanity
- [ ] Section header service (photo + titre + accroche)
- [ ] Section approche / déroulé d'un RDV (pour toilettage et crèche)
- [ ] Composant Tarifs avec disclaimer "selon race/poids" (données Sanity)
- [ ] Composant FAQ accordéon (questions/réponses depuis Sanity)
- [ ] CTA flottant mobile (Appeler / Réserver)
- [ ] SEO individualisé par service
- Pages : /services/toilettage, /services/bains, /services/creche, /services/education, /services/osteo

## Phase 5: Page Concept

- [ ] Section histoire de Merci Murphy (rich text depuis Sanity)
- [ ] Section mascotte Murphy (photo + texte)
- [ ] Section équipe (TeamMemberCards depuis Sanity)
- [ ] Section valeurs et engagements écoresponsables

## Phase 6: Formulaires & Réservation

- [ ] Page /reservation : formulaire multi-étapes (4 étapes)
  - Étape 1 : Choix du service
  - Étape 2 : Infos chien (race, poids, état du poil)
  - Étape 3 : Infos contact (nom, email, tél)
  - Étape 4 : Message libre + embed Calendly
- [ ] Server Action : validation Zod + insert Supabase table `leads`
- [ ] Email de confirmation client via Resend
- [ ] Email de notification interne merci murphy via Resend
- [ ] Page /contact : formulaire simple + Google Maps + coordonnées
- [ ] Inscription newsletter (footer + pop-up au scroll 60%)
- [ ] Server Action newsletter : insert Supabase table `newsletter_subscribers`

## Phase 7: E-commerce Shopify

- [ ] Client Shopify Storefront API dans /lib/shopify.ts
- [ ] Page /shop : grille produits avec filtres par catégorie
- [ ] Catégories : petlovers / chiens / marque propre merci murphy
- [ ] Page produit /shop/[category]/[slug] avec fiche détaillée
- [ ] Composant AddToCart (redirige vers Shopify checkout natif)
- [ ] Revalidation ISR via webhook Shopify (mise à jour stock/prix auto)
- [ ] Mise en avant produits marque propre sur la page Accueil

## Phase 8: SEO, Performance & Analytics

- [ ] Sitemap.xml dynamique (routes statiques + slugs Sanity + produits Shopify)
- [ ] robots.txt
- [ ] Metadata dynamiques sur toutes les pages (via generateMetadata)
- [ ] OpenGraph images auto-générées via next/og
- [ ] Audit et fix images : next/image + blur placeholder partout
- [ ] Score Lighthouse > 90 sur Accueil, Toilettage, Shop
- [ ] Intégration Plausible (script dans layout.tsx)
- [ ] Pages légales : Mentions légales + Politique de confidentialité (statiques)

## Phase 9: QA & Polish

- [ ] Tests cross-browser : Chrome, Safari, Firefox, Edge
- [ ] Tests mobile : iOS Safari, Android Chrome
- [ ] Vérification tous les formulaires en production
- [ ] Test tunnel Shopify complet (ajout panier → checkout)
- [ ] Vérification SEO (crawl Screaming Frog, structured data validator)
- [ ] Redirects 301 depuis l'ancien site
- [ ] README.md : guide de mise à jour Sanity pour l'équipe merci murphy

## Phase 10: Mise en production

- [ ] Cutover DNS vers Vercel
- [ ] Monitoring Vercel (alertes erreurs)
- [ ] Vérification Plausible actif en prod
- [ ] Briefing équipe merci murphy : CMS, formulaires, Shopify

---

## Open Questions

- URL exacte de l'eshop Shopify existant ?
- Calendly déjà créé ? Si oui, URL de l'événement ?
- Photos/vidéos disponibles pour le hero ? (sinon placeholder)
- Domaine final : mercimurphy.com ou autre ?
- Adresse email pour les notifications internes (Resend) ?

## Notes

- V1 : pas de validation en ligne ni d'empreinte bancaire pour les RDV
- Les tarifs sont indicatifs sur le site, l'équipe rappelle pour confirmer
- Calendly uniquement pour les bains (self-service) en V1
