# Blog — Design Spec

**Date:** 2026-04-01  
**Status:** Approved

## Overview

A blog section integrated directly at `/blog` on mercimurphy.com (not a subdomain). Content managed via Sanity. Two routes: listing page and individual article page.

## Routes

| Route          | Description                                       |
| -------------- | ------------------------------------------------- |
| `/blog`        | Listing éditorial, layout 2 colonnes asymétriques |
| `/blog/[slug]` | Article individuel, centré + "À lire aussi"       |

Both pages use `revalidate = 3600`.

## Sanity Schema — `post`

File: `src/sanity/schemas/post.ts`

| Field         | Type                  | Required | Notes                                                  |
| ------------- | --------------------- | -------- | ------------------------------------------------------ |
| `title`       | string                | yes      | —                                                      |
| `slug`        | slug                  | yes      | auto-generated from title                              |
| `coverImage`  | image                 | no       | includes `alt` text                                    |
| `category`    | string                | yes      | enum: `Conseils`, `Bien-être`, `Produits`, `Éducation` |
| `excerpt`     | text                  | yes      | 1–2 sentences; used in cards and meta description      |
| `body`        | array (Portable Text) | yes      | rich content                                           |
| `publishedAt` | datetime              | yes      | —                                                      |
| `readingTime` | number                | yes      | minutes, entered manually                              |

Schema registered in `src/sanity/schemas/index.ts`.

## GROQ Queries

File: `src/sanity/queries/posts.ts`

- `getAllPosts()` — all published posts sorted by `publishedAt` desc, lightweight fields only (no `body`)
- `getPostBySlug(slug: string)` — full post including `body`
- `getRelatedPosts(currentSlug: string)` — up to 3 other posts excluding current, lightweight fields only

A post is considered published when `publishedAt <= now()`.

## Pages

### `/blog` — Listing

Layout: **2-column asymmetric editorial**

- Left column: 1 large featured article (cover image + category + title + excerpt) + 1 secondary article below it
- Right column: compact list with thumbnail + category + title + reading time

Featured article = most recent. Secondary + list = remaining posts sorted by date.

If fewer than 2 posts exist, render a single centered card instead of the 2-column layout.

Component: `PostCard` — reusable card used in both columns (props control size variant: `featured`, `secondary`, `compact`).

SEO: static metadata (title, description, OG image using `/og/og-home.jpg`).

### `/blog/[slug]` — Article

Layout: **centered single column + conditional "À lire aussi"**

Structure:

1. Hero — cover image full width, aspect `16/9`, with `BLUR_PLACEHOLDER`
2. Header — centered: category + reading time, title (Playfair Display), date, author ("L'équipe Merci Murphy")
3. Divider
4. Body — Portable Text, centered, max-width `prose` (~65ch), using existing `PortableText` component (`src/components/sections/portable-text.tsx`)
5. "À lire aussi" section — 3 `PostCard` (compact variant) in a grid — **rendered only if `getRelatedPosts()` returns ≥ 2 articles**

SEO: `generateMetadata` from `title` + `excerpt` + `coverImage` (OG 1200×630 via Sanity CDN).  
Static generation: `generateStaticParams` from `getAllPosts()`.

## Components

| Component  | File                                    | Notes                                               |
| ---------- | --------------------------------------- | --------------------------------------------------- |
| `PostCard` | `src/components/sections/post-card.tsx` | 3 size variants: `featured`, `secondary`, `compact` |

Existing component reused: `PortableText` at `src/components/sections/portable-text.tsx`.

## Navigation

Add "Blog" link to the main navbar and footer. Position: after "Concept" in the nav, before legal links in the footer.

## Roadmap

Add Phase 10.5 to `project/ROADMAP.md` after Phase 10.

## Out of Scope

- Comments
- Search / filtering by category
- Newsletter CTA inside articles
- Author profiles (always "L'équipe Merci Murphy")
- Pagination (load all posts, add if needed later)
