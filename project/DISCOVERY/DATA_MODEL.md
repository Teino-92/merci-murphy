# Data Model

## Supabase Tables

### leads

| Column                | Type        | Notes                                                       |
| --------------------- | ----------- | ----------------------------------------------------------- |
| id                    | uuid        | PK, default gen_random_uuid()                               |
| created_at            | timestamp   | default now()                                               |
| nom                   | text        | required                                                    |
| email                 | text        | required                                                    |
| telephone             | text        | required                                                    |
| service               | text        | enum: toilettage, bains, creche, education, osteo, autre    |
| race_chien            | text        | nullable                                                    |
| poids_chien           | text        | nullable (ex: "5-10kg")                                     |
| etat_poil             | text        | nullable (ex: "normal", "emmêlé", "long")                   |
| message               | text        | nullable                                                    |
| source                | text        | enum: reservation, contact, newsletter                      |
| status                | text        | default: 'new' — enum: new, contacted, confirmed, cancelled |
| dog_id                | uuid        | FK → dogs (nullable — for online bookings)                  |
| calendly_event_uuid   | text        | nullable — set after Calendly booking created               |
| calendly_invitee_uuid | text        | nullable                                                    |
| sumup_checkout_id     | text        | nullable                                                    |
| deposit_amount        | numeric     | nullable — 60.00 for Toilettage V1                          |
| deposit_paid_at       | timestamptz | nullable — when SumUp confirmed payment                     |
| scheduled_at          | timestamptz | nullable — booked appointment date/time                     |

### dogs

| Column            | Type      | Notes                                                                         |
| ----------------- | --------- | ----------------------------------------------------------------------------- |
| id                | uuid      | PK, default gen_random_uuid()                                                 |
| created_at        | timestamp | default now()                                                                 |
| owner_id          | uuid      | FK → auth.users, required                                                     |
| name              | text      | Dog's name, required                                                          |
| breed             | text      | nullable                                                                      |
| grooming_duration | integer   | Duration in minutes — set by team only, never by client                       |
| notes             | text      | Internal team notes (coat condition, behaviour, etc.) — not visible to client |
| can_book_online   | boolean   | default false — team sets to true after first visit                           |

**RLS:**

- SELECT: authenticated user where `owner_id = auth.uid()`
- INSERT: authenticated user (creates their own dog profile)
- UPDATE `grooming_duration`, `notes`, `can_book_online`: service role only (team dashboard)

---

### newsletter_subscribers

| Column     | Type      | Notes            |
| ---------- | --------- | ---------------- |
| id         | uuid      | PK               |
| email      | text      | unique, required |
| created_at | timestamp | default now()    |
| active     | boolean   | default true     |

## RLS Policies (Supabase)

- `leads` : INSERT public (anon key), SELECT/UPDATE service role uniquement
- `newsletter_subscribers` : INSERT public (anon key), SELECT/UPDATE service role uniquement

## Sanity Schemas (CMS)

### service

```
{
  title: string,
  slug: slug,
  description: string (courte accroche),
  approche: PortableText (rich text),
  deroulé: PortableText (nullable — pour toilettage et crèche),
  tarifs: [{label: string, prix: string, disclaimer: string}],
  faq: [{question: string, reponse: PortableText}],
  image: image,
  cta: {label: string, type: 'reservation' | 'telephone'}
}
```

### teamMember

```
{
  nom: string,
  role: string,
  bio: text,
  photo: image,
  ordre: number
}
```

### testimonial

```
{
  auteur: string,
  note: number (1–5),
  texte: text,
  service: reference → service (nullable),
  date: date
}
```

### siteSettings (singleton)

```
{
  adresse: string,
  ville: string,
  codePostal: string,
  telephone: string,
  email: string,
  horaires: [{jour: string, heures: string}],
  instagram: string (URL),
  google_maps_url: string,
  calendly_url: string
}
```

## Shopify (read-only via Storefront API)

- Products → /shop/[category]/[slug]
- Collections → filtres catégories
- Checkout → natif Shopify (redirect)

## Relationships

- leads.service → référence textuelle au slug de service Sanity
- testimonial → service (optionnel)
