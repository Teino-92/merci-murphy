# Web Push Notifications — Design

**Date :** 2026-04-22
**Statut :** Design approuvé, prêt pour plan d'implémentation
**Scope :** Push notifications mobile/desktop pour staff dashboard (PWA installée)

## Contexte

Le dashboard affiche actuellement des notifications temps réel via Supabase Realtime + Notification API in-page (`src/components/dashboard/realtime-notifications.tsx`). Cela ne fonctionne que lorsque le tab est ouvert au premier plan. Objectif : vraies push notifications web (style WhatsApp) qui réveillent le device même PWA fermée.

## Objectifs

- Staff reçoit une push notification mobile/desktop sur 4 événements critiques
- Fonctionne avec infra existante uniquement (zéro coût, zéro SaaS tiers)
- Click sur notif ouvre la page dashboard pertinente
- Fonctionne sur iOS (Safari PWA installée), Android Chrome, desktop Chrome/Firefox

## Non-Objectifs

- Push vers clients (V2 éventuel)
- Toggle par type d'événement par utilisateur
- Badge count app icon
- Rich notifications (images, boutons d'action)
- Silent push / background sync / cache offline

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Browser (PWA installée, SW enregistré)                  │
│  ┌──────────────┐        ┌────────────────────────┐    │
│  │ UI bouton    │───────▶│ sw.js                  │    │
│  │ Activer push │ subscribe  • push event handler │    │
│  └──────────────┘        │  • notificationclick   │    │
│         │                └────────────────────────┘    │
│         │ POST /api/push/subscribe                      │
└─────────┼───────────────────────────────────────────────┘
          │
┌─────────┼───────────────────────────────────────────────┐
│ Next.js Server                                          │
│  ┌──────▼────────────┐    ┌──────────────────────┐     │
│  │ /api/push/        │    │ lib/push.ts          │     │
│  │  subscribe        │    │  sendPushToStaff()   │     │
│  │  unsubscribe      │    │  (web-push lib)      │     │
│  └───────────────────┘    └──────────┬───────────┘     │
│         │                            │                  │
│         ▼                            │ appelée depuis   │
│  Supabase push_subscriptions         │ Server Actions   │
│                                      ▼                  │
│                    actions.ts (create lead/visit)       │
│                    dog-actions.ts                       │
│                    confirm-deposit route                │
└─────────────────────────────────────────────────────────┘
          │
          ▼
      Web Push Service (FCM/APNS/Mozilla) → device
```

### Flux souscription

1. User (staff) ouvre PWA installée
2. Navigue vers `/dashboard/settings`
3. Click "Activer notifications push"
4. Browser : `Notification.requestPermission()` → `'granted'`
5. Browser : `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })`
6. Client POST `/api/push/subscribe` avec `{ endpoint, keys, userAgent }`
7. Server upsert row `push_subscriptions` liée à `auth.user_id`

### Flux envoi

1. Server Action crée visit/lead (INSERT Supabase)
2. Après INSERT succès, appelle `sendPushToStaff(event, data)`
3. Helper query `push_subscriptions` pour tous les users dont email ∈ staff allowlist
4. Parallel `webpush.sendNotification(sub, JSON.stringify(payload))`
5. Erreur 410/404 → delete row sub
6. Autres erreurs → log, continue (jamais throw depuis Server Action)

### Flux réception

1. Web Push Service livre payload au SW du device
2. SW `push` event → `showNotification(title, { body, data: { url }, icon, tag })`
3. User tape notif → `notificationclick`
4. SW focus window existante matching URL sinon `clients.openWindow(url)`

## Composants

### Nouveaux fichiers

| Fichier                                               | Rôle                                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| `public/sw.js`                                        | Service worker. Handlers `push`, `notificationclick`. Pas de cache.             |
| `src/lib/push.ts`                                     | Helper serveur. `sendPushToStaff(event, data)`. Init `web-push` avec VAPID env. |
| `src/app/api/push/subscribe/route.ts`                 | POST (upsert sub), DELETE (unsubscribe).                                        |
| `src/components/dashboard/push-toggle.tsx`            | Bouton UI avec états multiples.                                                 |
| `src/components/dashboard/sw-register.tsx`            | Client component `useEffect` register SW.                                       |
| `src/app/(dashboard)/dashboard/settings/page.tsx`     | Page settings embarque `<PushToggle />`.                                        |
| `supabase/migrations/YYYYMMDD_push_subscriptions.sql` | Table + RLS.                                                                    |

### Fichiers modifiés

- `src/lib/actions.ts` → appel `sendPushToStaff('new-lead' | 'new-visit', ...)` après INSERT succès
- `src/lib/dog-actions.ts` → idem pour visits créées via booking
- Route confirm-deposit (à localiser) → appel `'deposit-paid'`
- Server Action qui passe visit à `pending_deposit` → appel `'pending-deposit'`
- `src/app/(dashboard)/layout.tsx` → monte `<SwRegister />`
- `src/components/dashboard/nav.tsx` → lien "Settings"

### Dépendances npm

- `web-push`
- `@types/web-push`

### Env vars nouvelles

```
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:contact@mercimurphy.fr
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
```

Générer via `npx web-push generate-vapid-keys` une fois, stocker `.env.local` + Vercel.

## Data Model

### Migration

```sql
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_used_at timestamptz not null default now()
);

create index push_subscriptions_user_id_idx
  on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

create policy "users select own subs"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "users insert own subs"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "users delete own subs"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);
```

Service role (helper serveur) bypass RLS pour query tous les subs staff.

### Event types (app-level)

```ts
type PushEventType = 'new-lead' | 'new-visit' | 'pending-deposit' | 'deposit-paid'
```

Pas de table `push_preferences` (tous événements pour tous staff).

## API Contracts

### `POST /api/push/subscribe`

Auth : session Supabase + `hasDashboardAccess(user.email)`.

Request :

```ts
{
  endpoint: string
  keys: { p256dh: string, auth: string }
  userAgent?: string
}
```

Logique : upsert on conflict `endpoint` → update `p256dh`, `auth`, `last_used_at`, `user_id`.

Responses : `{ ok: true }` / 401 / 400.

### `DELETE /api/push/subscribe`

Body : `{ endpoint: string }`.
Delete row where `user_id = auth.uid() AND endpoint = ?`.
Response : `{ ok: true }`.

### `lib/push.ts` — signature

```ts
type PushEventType = 'new-lead' | 'new-visit' | 'pending-deposit' | 'deposit-paid'

type PushPayload = {
  title: string
  body: string
  url: string
  tag?: string
}

export async function sendPushToStaff(
  event: PushEventType,
  data: {
    nom?: string
    service?: string
    date?: string
    visitId?: string
    leadId?: string
  }
): Promise<void>
```

Mappe event → `{ title, body, url, tag }`, query subs, envoie parallèle, cleanup expirées.

### Deep link map

| Event             | URL                                              |
| ----------------- | ------------------------------------------------ |
| `new-lead`        | `/dashboard/leads`                               |
| `new-visit`       | `/dashboard/reservations`                        |
| `pending-deposit` | `/dashboard/reservations?filter=pending_deposit` |
| `deposit-paid`    | `/dashboard/reservations`                        |

### Service Worker `public/sw.js`

```js
self.addEventListener('push', (e) => {
  const data = e.data.json()
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/pwa-icon-192.png',
      badge: '/pwa-icon-192.png',
      data: { url: data.url },
      tag: data.tag,
    })
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = e.notification.data?.url || '/dashboard'
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then((wins) => {
      for (const w of wins) {
        if (w.url.includes(url) && 'focus' in w) return w.focus()
      }
      return clients.openWindow(url)
    })
  )
})
```

## UI Component `PushToggle`

### États

```ts
type State =
  | 'unsupported'
  | 'ios-needs-install'
  | 'denied'
  | 'default-unsubbed'
  | 'granted-unsubbed'
  | 'granted-subbed'
  | 'loading'
```

### Détection initiale

```ts
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
const isStandalone =
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as any).standalone === true

if (!('serviceWorker' in navigator) || !('PushManager' in window)) → 'unsupported'
else if (isIOS && !isStandalone) → 'ios-needs-install'
else vérifie Notification.permission + sub existante via registration.pushManager.getSubscription()
```

### Rendu par état

| État                                    | Affichage                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------- |
| `unsupported`                           | "Navigateur non compatible avec les notifications push."                                    |
| `ios-needs-install`                     | Instructions : "Partager → Ajouter à l'écran d'accueil, puis rouvrir l'app depuis l'icône." |
| `denied`                                | "Permissions bloquées. Réactive dans les réglages du navigateur."                           |
| `default-unsubbed` / `granted-unsubbed` | Bouton "Activer notifications push"                                                         |
| `granted-subbed`                        | Badge "Notifications actives" + bouton "Désactiver"                                         |
| `loading`                               | Spinner                                                                                     |

### Handler activation

```ts
async function activate() {
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return setState('denied')

  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
  })

  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: sub.endpoint,
      keys: sub.toJSON().keys,
      userAgent: navigator.userAgent,
    }),
  })
  setState('granted-subbed')
}
```

### Handler désactivation

```ts
async function deactivate() {
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  if (sub) {
    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    })
    await sub.unsubscribe()
  }
  setState('granted-unsubbed')
}
```

### Placement

Nouvelle page `src/app/(dashboard)/dashboard/settings/page.tsx` avec section "Notifications". Lien dans `nav.tsx`.

### SW Register

Composant `src/components/dashboard/sw-register.tsx` (client) :

```ts
'use client'
import { useEffect } from 'react'

export function SwRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])
  return null
}
```

Monté dans `src/app/(dashboard)/layout.tsx`.

## Erreurs

| Scénario                            | Gestion                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| `web-push` throw dans Server Action | try/catch, log `console.error`, jamais re-throw (pas casser INSERT visit/lead) |
| Status 410 / 404 endpoint           | delete row `push_subscriptions` immédiat                                       |
| Status 429 rate limit               | log, skip, pas de retry                                                        |
| VAPID keys manquantes env           | helper throw au module init → build fail fast                                  |
| SW register fail                    | silent catch, PushToggle affiche `unsupported`                                 |
| User perd permission après sub      | prochain push échoue 410 → cleanup auto                                        |

## Tests

### Unit (`lib/push.ts`)

- Mock `web-push.sendNotification`
- Vérifie parse erreurs 410/404 → appel delete sub
- Vérifie mapping event → payload correct
- Vérifie filtre staff allowlist

### Integration API routes

- POST `/api/push/subscribe` upsert correct
- DELETE scoped à `user_id`
- 401 si user pas staff
- 400 si payload invalide

### Manual QA (device réel)

1. Install PWA iOS Safari (Partager → Ajouter à l'écran d'accueil)
2. Ouvrir PWA, login staff
3. Settings → Activer push → permission granted
4. Créer un lead test depuis autre device / curl
5. Vérifie notif arrive PWA fermée
6. Tap notif → ouvre `/dashboard/leads` avec session
7. Répéter Android Chrome
8. Désactiver → créer nouveau lead → pas de push
9. Verif row supprimée DB

## Sécurité

- `VAPID_PRIVATE_KEY` **server-only** (pas `NEXT_PUBLIC_`)
- `/api/push/subscribe` vérifie `hasDashboardAccess` avant upsert
- RLS empêche user A lire/delete sub user B
- Payload push ne contient **pas** de données sensibles (noms complets clients, tél, email). Juste titre, body court, URL deep link. Détails visibles seulement après session dashboard valide
- Service Worker scope = `/` (racine public). Pas de cache, juste handlers push
- `endpoint` unique empêche duplicate sub même device

## Coûts

Zéro. Web Push Services (FCM Google, Mozilla, APNS Apple) sont gratuits et sans compte. VAPID keys générées local. Lib `web-push` MIT. Supabase free tier largement suffisant (~15 rows max). Vercel Server Actions déjà inclus plan actuel.

## Rollout

1. Merge migration DB + code sur preview
2. Générer VAPID keys local + add env Vercel preview + prod
3. Deploy preview → test iOS Safari + Android Chrome sur device réel
4. Merge main
5. Staff installe PWA (doc interne) + active push via settings

## Hors Scope V1

- Toggle par type d'événement
- Push vers clients finaux
- Badge count app icon
- Rich notifications (images, boutons d'action)
- Silent push / background sync
- Cache offline Service Worker
