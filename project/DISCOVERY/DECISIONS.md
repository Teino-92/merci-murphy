# Decisions Log

## 2026-02-21: Sanity.io comme CMS

**Context:** L'équipe merci murphy doit pouvoir modifier tarifs, FAQ, et contenu sans appeler un dev.
**Decision:** Sanity.io
**Reasoning:** Interface la plus intuitive pour les non-techniques. Schema flexible adapté aux FAQ et tarifs variables. Plan gratuit généreux. Alternative Contentful plus chère à l'échelle.

---

## 2026-02-21: Shopify Storefront API (pas migration vers autre solution)

**Context:** merci murphy a déjà un eshop Shopify opérationnel.
**Decision:** Conserver Shopify, l'exposer via Storefront API dans Next.js.
**Reasoning:** Zéro migration de données. L'équipe connaît déjà l'interface Shopify. Le checkout et la gestion des commandes restent identiques. On gagne uniquement le design custom.

---

## 2026-02-21: Calendly pour les réservations (V1)

**Context:** Le CDC demande "pas de validation en ligne, juste prise d'infos" pour V1.
**Decision:** Calendly embed gratuit pour les bains self-service uniquement. Formulaire custom pour tous les autres services.
**Reasoning:** Développement d'un système de réservation complet (empreinte bancaire, gestion créneaux temps réel) = scope V2. Calendly résout le besoin immédiat sans dev. Migration possible vers Reservio ou custom Stripe sans toucher l'architecture.

---

## 2026-02-21: Pas de compte utilisateur en V1

**Context:** Question de si on devait gérer un espace client pour les abonnés crèche.
**Decision:** Hors scope V1. Les abonnés crèche gèrent leurs RDV par téléphone ou via Calendly.
**Reasoning:** Complexity vs. valeur. L'espace client représente un chantier important (auth, dashboard, historique RDV) qui ralentirait le lancement sans apporter de valeur immédiate à la majorité des visiteurs.

---

## 2026-02-21: Plausible Analytics (pas Google Analytics)

**Context:** Besoin de tracker le trafic et les conversions.
**Decision:** Plausible Analytics
**Reasoning:** RGPD compliant sans cookie banner (important pour la France). Simple à intégrer. ~9€/mois. GA4 est gratuit mais complexe, nécessite un cookie banner, et collecte des données personnelles.

---

## Open Decisions (à trancher)

- [ ] URL exacte de l'eshop Shopify : shop.mercimurphy.com ?
- [ ] Domaine final du nouveau site : mercimurphy.com ?
- [ ] Adresse email interne pour les notifications Resend
- [ ] Calendly : compte déjà créé ? URL de l'événement ?
- [ ] Photos/vidéos disponibles pour le hero dès le lancement ?
