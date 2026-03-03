# User Stories

## Epic 1: Découverte des services

### US-1: Découvrir le toilettage

**As a** propriétaire de chien parisien
**I want to** comprendre l'approche toilettage de merci murphy, voir les tarifs indicatifs et savoir comment se passe un RDV
**So that** je me sente en confiance pour prendre rendez-vous

**Acceptance Criteria:**

- [ ] Page /services/toilettage accessible depuis l'accueil
- [ ] Approche expliquée en langage simple (pas de jargon)
- [ ] Tarifs indicatifs affichés avec disclaimer "selon race et poids"
- [ ] Déroulé d'un RDV expliqué étape par étape
- [ ] FAQ répond aux questions fréquentes (emmêlé, race, durée…)
- [ ] CTA "Prendre RDV" visible et cliquable

### US-2: Découvrir la crèche

**As a** propriétaire de chien qui travaille
**I want to** savoir comment fonctionne la crèche, les conditions d'admission et les tarifs
**So that** je puisse décider si c'est adapté à mon chien

**Acceptance Criteria:**

- [ ] Page /services/creche avec déroulé d'une journée type
- [ ] Conditions d'admission clairement listées
- [ ] Tarifs : abonnement et à la journée
- [ ] FAQ crèche (conditions sanitaires, tempérament, etc.)
- [ ] CTA "Réserver une journée test"

---

## Epic 2: Prise de rendez-vous

### US-3: Demander un RDV toilettage

**As a** nouveau client
**I want to** envoyer une demande de RDV en précisant les infos de mon chien
**So that** l'équipe merci murphy me rappelle pour confirmer le créneau

**Acceptance Criteria:**

- [ ] Formulaire multi-étapes sur /reservation
- [ ] Étape 1 : choix du service
- [ ] Étape 2 : race, poids, état du poil du chien
- [ ] Étape 3 : nom, email, téléphone
- [ ] Étape 4 : message libre
- [ ] Confirmation par email automatique après envoi
- [ ] Lead stocké dans Supabase (status: 'new')
- [ ] Notification interne envoyée à merci murphy

### US-4: Réserver un bain self-service

**As a** client qui veut laver son chien soi-même
**I want to** choisir un créneau disponible en ligne
**So that** je n'aie pas à appeler pour réserver

**Acceptance Criteria:**

- [ ] Embed Calendly sur la page /reservation (ou /services/bains)
- [ ] Choix du créneau directement dans le site
- [ ] Confirmation par email automatique Calendly

---

## Epic 3: E-commerce

### US-5: Acheter un produit merci murphy

**As a** pet lover en France ou à l'international
**I want to** parcourir les produits merci murphy et passer commande
**So that** je reçoive le produit à domicile

**Acceptance Criteria:**

- [ ] Catalogue /shop avec filtres par catégorie
- [ ] Produits marque propre mis en avant (badge "Merci Murphy")
- [ ] Fiche produit avec photos, description, prix
- [ ] Bouton "Ajouter au panier" → redirige vers Shopify checkout
- [ ] Checkout sur Shopify natif (on n'y touche pas)

### US-6: Découvrir la boutique physique

**As a** visiteur du site
**I want to** savoir ce que je peux trouver en boutique
**So that** j'aie envie de passer en magasin

**Acceptance Criteria:**

- [ ] Section boutique sur l'accueil avec teaser produits
- [ ] Adresse, horaires, et plan Google Maps sur /contact
- [ ] Lien "Voir tout le shop" vers /shop

---

## Epic 4: Confiance & Réassurance

### US-7: Lire des avis clients

**As a** visiteur qui ne connaît pas encore merci murphy
**I want to** lire des témoignages de clients satisfaits
**So that** je me sente rassuré avant de réserver

**Acceptance Criteria:**

- [ ] Section témoignages sur la page Accueil (3 cards minimum)
- [ ] Nom du client, service utilisé, note /5, texte
- [ ] Contenu géré depuis Sanity (modifiable sans dev)

### US-8: S'inscrire à la newsletter

**As a** client ou prospect
**I want to** recevoir les actualités, événements et promotions de merci murphy
**So that** je reste informé des nouveautés

**Acceptance Criteria:**

- [ ] Champ email dans le footer
- [ ] Pop-up d'inscription au scroll (60% de la page)
- [ ] Confirmation d'inscription (email Resend)
- [ ] Email stocké dans Supabase table newsletter_subscribers
