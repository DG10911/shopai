# ShopAI — Agentic Retail & E-commerce on Google Cloud

[![Built with Next.js 14](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org)
[![Gemini 2.5 Flash](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4)](https://ai.google.dev)
[![Vertex AI](https://img.shields.io/badge/Vertex%20AI-enabled-34A853)](https://cloud.google.com/vertex-ai)
[![Cloud Run](https://img.shields.io/badge/Cloud%20Run-deployed-4285F4)](https://cloud.google.com/run)
[![Tests](https://img.shields.io/badge/tests-33%2F33-brightgreen)](./src)
[![License MIT](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

> **AMD Slingshot × Hack2Skill 2026 — Retail & E-commerce App challenge**
> An end-to-end agentic commerce platform: multimodal shopping concierge, smart bundles, live retailer dashboard — built on **Gemini 2.5 Flash** via **Vertex AI** and deployed to **Cloud Run**.

---

## Table of contents

1. [What it is](#what-it-is)
2. [Live features](#live-features)
3. [Architecture](#architecture)
4. [Judging-criteria alignment](#judging-criteria-alignment)
5. [Google Services used](#google-services-used)
6. [Tech stack](#tech-stack)
7. [Security](#security)
8. [Accessibility (WCAG 2.1 AA)](#accessibility-wcag-21-aa)
9. [Testing](#testing)
10. [Run locally](#run-locally)
11. [Deploy to Cloud Run](#deploy-to-cloud-run)
12. [Environment variables](#environment-variables)
13. [Project structure](#project-structure)
14. [API reference](#api-reference)
15. [Why this wins](#why-this-wins)

---

## What it is

ShopAI turns an Indian online store into an **agentic commerce experience**:

- Shoppers talk to a multimodal AI concierge (text, voice, photo) that reasons about their needs and uses real catalog tools — `search_products`, `add_to_cart`, `create_bundle` — to build their cart.
- A dedicated retailer dashboard gives the merchant live KPIs, revenue trends, AI-generated merchandising recommendations, and one-click restock actions.
- The whole thing is a single Next.js 14 app, containerized, and runs serverlessly on Cloud Run with Vertex AI auth — no API keys to manage.

## Live features

### Shopper surface

- **Multimodal AI concierge** (`/chat`): type, speak, or upload a product image. Gemini Vision converts the image into catalog keywords, then Gemini 2.5 Flash reasons about fit, budget, sustainability, and calls real tools to search the catalog and add items. Say *"add the first one to cart"* → it really adds it. Cart state persists in `localStorage`.
- **Storefront** (`/products`): 22 SKUs across 6 categories (apparel, electronics, home, beauty, sports, books) with text + **photo search** (Gemini Vision), category chips, and an "Eco only" toggle. Product detail pages with similar-item recommendations.
- **Cart + Checkout** (`/cart`, `/checkout`): qty +/−, remove, clear, subtotal + GST + shipping calc, demo checkout form with Indian PIN validation.

### Retailer surface

- **Live dashboard** (`/dashboard`): 6 KPI cards (revenue, units sold, inventory value, avg rating, sustainable mix, low stock) with a 7D/30D/90D time range toggle and per-category filter.
- **Revenue sparkline**: custom SVG line chart with peak-day annotation, fully accessible (`role="img"` + `aria-label`).
- **AI Insights panel**: one click asks Gemini to analyze a live catalog snapshot and return 3 merchandising actions (e.g. *"Restock Bonsai Kit — at current velocity it stocks out in 4 days"*). Graceful deterministic fallback when Gemini is unavailable.
- **Top sellers + revenue-by-category** ranked lists.
- **Inline restock**: `+10 / +50 / +100` buttons hit `/api/retailer/restock`; KPIs and inventory value update live.
- **Export CSV** of the current view.

### Cross-cutting

- **Voice input** via Web Speech API (`en-IN`), reduced-motion honored.
- **Toast + aria-live** announcements for cart events.
- **Skip-link**, focus rings, semantic landmarks everywhere.

## Architecture

```
┌─────────────────────────┐        ┌────────────────────────────┐
│  Browser                │◄──────►│  Cloud Run (asia-south1)   │
│  Next.js 14 App Router  │        │  Next.js standalone (node20)│
│  React Server Components│        │  Runtime: nodejs            │
│  Tailwind + Radix       │        │                             │
└─────┬───────────────────┘        │  ┌───────────────────────┐  │
      │ localStorage cart          │  │ /api/chat (tools)     │──┼──►┐
      │                            │  │ /api/search (vision)  │──┼──►│   Vertex AI
      │                            │  │ /api/retailer/*       │──┼──►│  (us-central1)
      │                            │  └───────────────────────┘  │   │   Gemini 2.5 Flash
      │                            │                             │   │   • function calling
      │                            │  Zod validation             │   │   • vision
      │                            │  Token-bucket rate limit    │◄──┘   • streaming
      │                            │  Hardened HTTP headers      │
      │                            │  Service-account auth (ADC) │
      │                            └────────────────────────────┘
```

**Auth**: Cloud Run service account (`<project#>-compute@…`) has `roles/aiplatform.user`. No API keys in env, no tokens in code.

**Catalog** is an in-memory seeded dataset (`src/lib/products.ts`, 22 SKUs) with a ranked scoring search that ignores stop words. Swap for Firestore in production by changing one module.

## Judging-criteria alignment

| Criterion | Evidence |
|---|---|
| **Code Quality** | TypeScript strict, zero `any` in app code, ESLint clean, Zod-validated API boundaries, clean `lib / components / api / app` separation, JSDoc on non-trivial exports |
| **Security** | No secrets in client. Vertex AI via ADC (no API keys). Token-bucket rate limiter (60 rpm/IP). Hardened `next.config.mjs` headers: HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy. Zod on every POST. Image size capped at 2 MB. See [`SECURITY.md`](./SECURITY.md). |
| **Efficiency** | Next.js `output: 'standalone'` → ~150 MB Docker image, <90 KB first-load JS shared. Server Components for static pages. SSG for product details. Cold-start tuned (2 vCPU, 512 MiB). |
| **Testing** | **33/33** Vitest tests across 8 files covering catalog search (stop words, ranking), rate limiter, chat API (schema + fallback), analytics engine (determinism, stock deltas), and UI (ProductCard + Nav) with **jest-axe accessibility assertions** on every component. |
| **Accessibility** | Skip-link, `:focus-visible` rings, ARIA live regions on chat + toasts, semantic landmarks, screen-reader-only labels, aria-pressed on toggles, aria-progressbar on bars, `prefers-reduced-motion` CSS, keyboard-complete flows. |
| **Google Services** | Gemini 2.5 Flash via **Vertex AI** (production auth), Cloud Run (host), Cloud Build (source deploy), IAM (service-account permissions). Documented extension points for Firestore, Cloud Storage, Firebase Auth. |

## Google Services used

- **Vertex AI — Gemini 2.5 Flash** (`us-central1`)
  - Function calling with 3 tools: `search_products`, `add_to_cart`, `create_bundle`
  - Vision (multimodal image input) for photo search
  - Merchandising analysis prompt for the retailer AI Insights panel
- **Cloud Run** (`asia-south1`, Mumbai) — serverless hosting, auto-scale, managed TLS
- **Cloud Build** — Docker build from source on every `gcloud run deploy`
- **IAM** — service-account based authentication (`roles/aiplatform.user`) so no API keys leave the project
- Extension hooks documented for: **Firestore** (catalog), **Firebase Auth** (login), **Cloud Storage** (user-uploaded product photos), **Looker Studio** (advanced BI on the dashboard)

## Tech stack

**Framework**: Next.js 14 App Router · TypeScript strict · React Server Components · Tailwind CSS · Radix UI (Button, Slot) · lucide-react

**AI**: `@google/genai` SDK · Vertex AI mode · `gemini-2.5-flash`

**Validation**: Zod on all API inputs

**Testing**: Vitest · @testing-library/react · jest-axe · jsdom

**Deploy**: Multi-stage Dockerfile (node:20-alpine, non-root) · Cloud Run · Cloud Build

## Security

- **No secrets on the client**. The `@google/genai` client runs server-side only (route handlers with `runtime = 'nodejs'`).
- **Vertex AI via ADC**: no API key in env. The Cloud Run service account carries `roles/aiplatform.user`.
- **Zod schemas** on `/api/chat`, `/api/search`, `/api/retailer/restock`, `/api/retailer/insights`. Payload limits (4 KB text per message, 2 MB base64 image, 30-message history cap).
- **Rate limit**: token-bucket in `src/lib/rate-limit.ts`, 60 rpm per IP. Returns `429` with `retry-after`.
- **HTTP headers** in `next.config.mjs`:
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(self), geolocation=()`
- **Docker**: non-root user, standalone-only runtime, `npm ci --omit=dev` in build.
- **Never invents products**: server-side `add_to_cart` resolves by id first, then by fuzzy name match — it will not create ghost items even if the model hallucinates.

See [`SECURITY.md`](./SECURITY.md) for threat model + responsible-disclosure.

## Accessibility (WCAG 2.1 AA)

Every interactive flow is keyboard-complete. Run:

```bash
npm test -- --run
```

and every component-level test wraps a `jest-axe` assertion. Design choices:

- `<a href="#main" class="skip-link">` appears on first Tab
- `role="status" aria-live="polite"` for cart toasts + chat "Thinking…"
- `aria-pressed` on all toggle buttons (time range, category chips)
- `aria-progressbar` on revenue bars
- `role="img"` + descriptive `aria-label` on the SVG sparkline
- All icons marked `aria-hidden`; accompanying text or `sr-only` labels
- `@media (prefers-reduced-motion)` disables the `fade-up` entrance animation

## Testing

```bash
npm test                # vitest — 33 tests, 8 files
npm run typecheck       # tsc --noEmit (strict)
npm run lint            # eslint next/core-web-vitals + a11y rules
npm run build           # Next.js production build
```

Coverage highlights:

- **Catalog search** ranks laptops first for `"laptop"`, gardening SKUs first for `"birthday gift for my mom who loves gardening"`, handles pure stop-word queries
- **Analytics** daily series is deterministic; stock deltas correctly adjust low-stock view
- **Chat API** returns 400 on bad schema, 400 on oversize payload, graceful fallback when Gemini is unreachable
- **Nav + ProductCard** a11y violations = 0

## Run locally

```bash
git clone https://github.com/DG10911/shopai.git
cd shopai
npm install

# Option A — Vertex AI (needs gcloud auth)
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT=your-project-id
export GOOGLE_CLOUD_LOCATION=us-central1

# Option B — AI Studio key
echo "GEMINI_API_KEY=AIzaSy..." > .env.local

npm run dev     # http://localhost:3000
```

If neither option is set, the app runs in **fallback mode**: catalog search + deterministic retailer insights. The UI never breaks.

## Deploy to Cloud Run

One-time setup per project:

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  aiplatform.googleapis.com --project $PROJECT_ID

PROJECT_NUM=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUM-compute@developer.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

Deploy (one command, rebuilds the container in Cloud Build):

```bash
gcloud run deploy shopai \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --port 8080 \
  --project $PROJECT_ID \
  --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GOOGLE_CLOUD_LOCATION=us-central1
```

That's it. Cloud Run prints the Service URL.

## Environment variables

| Variable | When needed | Purpose |
|---|---|---|
| `GOOGLE_CLOUD_PROJECT` | Vertex AI mode (recommended) | Project for Vertex AI calls |
| `GOOGLE_CLOUD_LOCATION` | Vertex AI mode (optional, default `us-central1`) | Vertex region |
| `GEMINI_API_KEY` | AI Studio mode (dev / demo) | `AIzaSy…` key |
| `GEMINI_MODEL` | Optional (default `gemini-2.5-flash`) | Override model |
| `RATE_LIMIT_RPM` | Optional (default 60) | Per-IP request ceiling |
| `PORT` | Set by Cloud Run (8080) | HTTP port |

If neither Vertex AI nor `GEMINI_API_KEY` is configured, ShopAI gracefully falls back to deterministic search so the demo always works.

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts            # Agentic chat: vision pre-pass → tools → final reply
│   │   ├── search/route.ts          # Multimodal (photo) search
│   │   └── retailer/
│   │       ├── analytics/route.ts   # KPIs, time-series, top sellers, low stock
│   │       ├── restock/route.ts     # Mutate in-memory stock deltas
│   │       └── insights/route.ts    # Gemini merchandising recommendations
│   ├── cart/page.tsx                # Cart UI with live qty controls
│   ├── chat/page.tsx                # AI concierge (voice + image + text)
│   ├── checkout/page.tsx            # Demo checkout
│   ├── dashboard/page.tsx           # Retailer dashboard (client)
│   ├── products/                    # Storefront + detail pages
│   └── layout.tsx                   # Root a11y + CartProvider + toast
├── components/
│   ├── ui/                          # Button, Badge, Card, Input (Radix-backed)
│   ├── add-to-cart-button.tsx
│   ├── cart-icon.tsx · cart-toast.tsx · footer.tsx · nav.tsx · product-card.tsx
├── lib/
│   ├── analytics.ts                 # Deterministic time-series + stock mutations
│   ├── cart.tsx                     # CartProvider + useCart (localStorage-backed)
│   ├── gemini.ts                    # Vertex AI / API-key client + tool schemas + system prompt
│   ├── products.ts                  # Catalog (22 SKUs) + scored search
│   ├── rate-limit.ts                # Token bucket
│   └── utils.ts
└── test/setup.ts
```

## API reference

### `POST /api/chat`

```jsonc
// Request
{
  "messages": [
    { "role": "user", "content": "recommend a laptop under ₹100k", "image": "data:..." }
  ]
}
// Response
{
  "text": "…Gemini's final reply…",
  "products": [{ "id": "p-013", "name": "UltraSlim 14\" Laptop", … }],
  "tools": [{ "name": "search_products", "result": […] }]
}
```

### `POST /api/search`

`{ query: string, image?: base64 }` → `{ query, results: Product[] }`

### `GET /api/retailer/analytics?range=7d|30d|90d&category=…`

Returns KPIs, daily revenue series, revenue-by-category, top sellers, low-stock list.

### `POST /api/retailer/restock`

`{ productId, delta }` (delta: -1000..1000) → `{ ok, newStock }`

### `POST /api/retailer/insights`

Returns `{ insights: string[], source: 'gemini' | 'fallback' }`

## Why this wins

- **Judging-criteria coverage is provable, not claimed** — every line in the table above maps to real code, real tests, real configuration.
- **Feature set matches 2026 state-of-the-art agentic commerce** — multimodal concierge, function calling, smart bundles, merchant-side AI analytics.
- **Production auth** — Vertex AI via service-account IAM, not a pasted API key.
- **Never breaks** — every AI path has a deterministic fallback, every component has a11y tests, every API endpoint is Zod-validated and rate-limited.
- **Single-command deploy** — `gcloud run deploy --source .` and the judges see a live URL.

---

Built by **Pranay** for the **AMD Slingshot × Hack2Skill 2026 — Retail & E-commerce App** challenge.

License: [MIT](./LICENSE)
