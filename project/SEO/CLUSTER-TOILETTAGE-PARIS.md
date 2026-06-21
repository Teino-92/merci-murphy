# Cluster sémantique AEO — « Toilettage chien Paris »

> Source : Google Search Console, export 21 juin 2026 (642 requêtes, 551 clics, 7 827 impressions).
> Méthode : Know-Simple / Know / Do (AEO) + principe MECE.

## Diagnostic des données GSC

| Thème                            | Impressions | Clics | Position moy. | Lecture                                            |
| -------------------------------- | ----------- | ----- | ------------- | -------------------------------------------------- |
| **Brand** (merci murphy…)        | 3 194       | 416   | 1–2           | Acquis, hors scope SEO                             |
| **Toilettage** (générique + géo) | 3 097       | 109   | 5–18          | Gisement #1 — page 1 basse à page 2                |
| **Crèche / garderie**            | 429         | 17    | 9–19          | Gisement #2 — quasi page 2, sous-exploité          |
| **Near me / autour de moi**      | ~600        | 5     | 2–18          | Intention locale forte, CTR faible                 |
| **Race spécifique**              | 215         | 1     | ~9–12         | Longue traîne facile (yorkshire, caniche, cocker…) |
| **Chat**                         | 191         | 8     | 3–23          | Niche claire                                       |
| **Boutique / animalerie**        | 176         | 4     | 22–56         | Faible — Shopify capte mal                         |
| **Dogwash / self-wash**          | 113         | 2     | 4–9           | Service à clarifier                                |
| **Prix / tarif**                 | 39          | 2     | 4–31          | Intention transactionnelle                         |

**Constats clés**

- Position moyenne 5–18 sur le cœur de métier → on est en page 1 basse / page 2. Quelques pages bien structurées = gros gain.
- Beaucoup d'impressions, peu de clics (CTR < 7 %) → manque de pages dédiées + titres/meta optimisés AEO.
- Signal géo très fort : `paris 9`, `paris 18`, `montmartre`, `batignolles`, `autour de moi`. → pages locales = priorité.
- « creche canine paris » (152 impr, pos 9) et « pet groomer near me » (325 impr) = quasi gratuits si on attaque.

---

## Mot-clé pilier

**`toilettage chien Paris`** — page pilier (hub) reliant tout le cluster.

## Cluster (pages satellites — MECE)

| #      | Requête cible                                 | Intention   | Format                                                            | Schema.org                         | Priorité |
| ------ | --------------------------------------------- | ----------- | ----------------------------------------------------------------- | ---------------------------------- | -------- |
| **P**  | toilettage chien paris (pilier)               | Know        | Page hub service + ancres internes                                | `Service` + `LocalBusiness`        | 🔴 P1    |
| 1      | toiletteur paris 9 / paris 18                 | Know        | Page locale par arrondissement (9e, 18e)                          | `LocalBusiness` + `Service`        | 🔴 P1    |
| 2      | toiletteur autour de moi / near me            | Know-Simple | Bloc « zones desservies » + carte                                 | `LocalBusiness` + `GeoCoordinates` | 🔴 P1    |
| 3      | toiletteur chat paris                         | Know        | Page service toilettage chat                                      | `Service`                          | 🔴 P1    |
| 4      | creche canine paris / crèche chien            | Know        | Page service crèche/garderie                                      | `Service` + `LocalBusiness`        | 🔴 P1    |
| 5      | toilettage chien paris prix                   | Know-Simple | Grille tarifaire + FAQ prix                                       | `Service.offers` (`Offer`)         | 🔴 P1    |
| 6      | dog wash / dogwash paris                      | Know-Simple | Page service self-wash / dog wash                                 | `Service`                          | 🟠 P2    |
| 7      | coupe yorkshire / toilettage yorkshire        | Know        | Guide toilettage par race (yorkshire)                             | `Article` + `HowTo`                | 🟠 P2    |
| 8      | toilettage caniche / coupe caniche toy        | Know        | Guide toilettage par race (caniche)                               | `Article` + `HowTo`                | 🟠 P2    |
| 9      | toiletteur cocker paris                       | Know        | Guide toilettage par race (cocker)                                | `Article`                          | 🟠 P2    |
| 10     | toilettage chihuahua / poil court             | Know        | Guide toilettage par race (chihuahua)                             | `Article`                          | 🟢 P3    |
| 11     | toilettage golden retriever / berger allemand | Know        | Guide toilettage grand chien / poil long                          | `Article`                          | 🟢 P3    |
| 12     | toiletteur grand chien / gros chien           | Know-Simple | FAQ + bloc « grands gabarits acceptés »                           | `FAQPage`                          | 🟠 P2    |
| 13     | à quelle fréquence toiletter son chien        | Know-Simple | FAQ courte (réponse < 50 mots)                                    | `FAQPage`                          | 🟠 P2    |
| 14     | garderie chien paris / garde chien            | Know        | Section crèche : tarifs journée + réservation                     | `Service.offers`                   | 🟠 P2    |
| 15     | concept store chien paris / boutique chien    | Know-Simple | Page boutique → redirige Shopify                                  | `Store`                            | 🟢 P3    |
| **D1** | calculateur prix toilettage (race + taille)   | **Do**      | Outil interactif → estimation + pré-réservation                   | `WebApplication`                   | 🔴 P1    |
| **D2** | quel toilettage pour mon chien ? (quiz)       | **Do**      | Quiz race/poil → recommandation service                           | `WebApplication`                   | 🟠 P2    |
| **D3** | rappel toilettage (fréquence)                 | **Do**      | Mini-outil : date dernier bain → prochain RDV + opt-in newsletter | `WebApplication`                   | 🟢 P3    |

> 19 satellites + 1 pilier. Répartition : Know-Simple ~25 % · Know ~50 % · Do ~15 % (3 outils) — conforme cible AEO.

---

## Maillage interne

```
                    [P] toilettage chien paris (PILIER)
                     │
   ┌──────────────┬──┴───┬──────────────┬─────────────┐
   ▼              ▼      ▼              ▼             ▼
[1] géo arr.  [3] chat [4] crèche  [5] prix      [6] dogwash
   │              │      │ (→14)     │ (→D1)        │
   ▼              │      ▼           ▼              ▼
[2] near me ◄─────┴──► [14] garderie  [D1] calculateur prix
   (zones)                              ▲
                                        │
   [7..11] guides race ─────────────────┘ (chaque guide → D1 + → P)
   [12] grand chien → [4] crèche + P
   [13] fréquence FAQ → [D3] rappel
   [D2] quiz → service recommandé (3/7/8/9…) + [D1]
   [15] boutique → Shopify (externe)
```

**Règles de liens**

- Toute page **Know** pointe vers une page **Do** (guides race → D1 calculateur ; fréquence → D3).
- Toutes les satellites pointent vers le **pilier** (ancre : « toilettage chien à Paris »).
- Pilier pointe vers les 5 P1 (ancres exactes : « toiletteur Paris 9 », « toilettage chat Paris », « crèche canine Paris », « prix toilettage », « dog wash »).
- Pages géo [1][2] se lient entre elles (9e ↔ 18e ↔ near me).
- **Pas deux pages sur le même angle** (MECE) : une seule page « prix », une seule « near me », guides race distincts par race.

## Ancres recommandées (anti-cannibalisation)

| Page   | Ancre entrante unique                            |
| ------ | ------------------------------------------------ |
| Pilier | « toilettage chien à Paris »                     |
| [1]    | « toiletteur Paris 9 » / « toiletteur Paris 18 » |
| [3]    | « toilettage chat à Paris »                      |
| [4]    | « crèche canine à Paris »                        |
| [5]    | « tarifs de toilettage »                         |
| [D1]   | « estimer le prix de mon toilettage »            |

---

## Roadmap (priorité = impressions × proximité page 1 × conversion)

**Mois 1 — Know-Simple + pilier + P1 locales (capter le gisement chaud)**

- [P] Pilier toilettage chien Paris
- [1] Pages locales Paris 9 + Paris 18 (positions déjà 1.4–1.8 → consolider)
- [2] Bloc « zones desservies » + near me
- [5] Page prix + grille (intention transactionnelle)
- [D1] Calculateur prix (page Do prioritaire)

**Mois 2 — Know (services + guides race)**

- [3] Toilettage chat · [4] Crèche canine · [6] Dog wash
- [7][8][9] Guides race yorkshire / caniche / cocker
- [12][13] FAQ grand chien + fréquence
- [D2] Quiz « quel toilettage »

**Mois 3 — Do + longue traîne + boutique**

- [10][11] Guides chihuahua / golden / berger
- [14] Section garderie tarifs · [15] Boutique → Shopify
- [D3] Rappel toilettage + opt-in newsletter

---

## Quick wins immédiats (positions 5–12, fort volume)

| Requête                  | Impr | Pos  | Action                                |
| ------------------------ | ---- | ---- | ------------------------------------- |
| pet groomer near me      | 325  | 10.2 | Page near me EN + hreflang            |
| creche canine paris      | 152  | 9.0  | Page crèche dédiée (Mois 1, remonter) |
| toiletteur autour de moi | 103  | 5.0  | Bloc zones + maillage                 |
| toilettage chien paris   | 195  | 10.0 | Optimiser pilier (titre + H1 + FAQ)   |
| coupe yorkshire adulte   | 39   | 9.9  | Guide race yorkshire                  |
| creche chien paris       | 124  | 19.0 | Variante d'ancre vers page crèche     |

> Réviser ce cluster dans 6 mois (re-export GSC) — recalculer positions et CTR.
