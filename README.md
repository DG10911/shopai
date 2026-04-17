# ShopAI — Agentic Retail & E-commerce on Google Cloud

> AMD Slingshot × Hack2Skill 2026 — Retail & E-commerce App challenge

ShopAI is an intelligent retail platform that uses **Google Gemini 2.5 Flash** with **function calling** to act as an agentic shopping concierge. It unifies multimodal product discovery (text, voice, image), a conversational agent that builds carts with reasoning, a personalized storefront, and a retailer insights dashboard — deployed as a single **Next.js 14** app on **Google Cloud Run**.

## ✨ Features

1. **Multimodal AI search** — type, speak, or upload a photo. Gemini Vision turns an image into a catalog query.
2. **Agentic AI concierge** — Gemini with 3 function-calling tools (`search_products`, `add_to_cart`, `create_bundle`) builds carts with reasoning.
3. **Smart bundles** — "Complete the look" / "Home-office under ₹20000" — Gemini composes themed baskets.
4. **Personalized homepage** — feed ranked by rating + sustainability (ready to swap for Firestore history).
5. **Voice-first accessibility** — Web Speech API + ARIA live regions + keyboard nav.
6. **Retailer insights dashboard** — revenue by category, low-stock alerts, sustainability mix.

## 🏗️ Architecture

```
┌────────────────┐      ┌──────────────────────┐      ┌─────────────────┐
│  Next.js 14    │──────▶│ /api/chat           │──────▶│ Gemini 2.5 Flash│
│  App Router    │      │  (function-calling) │      │  (@google/genai)│
│  React Server  │      │ /api/search         │      └─────────────────┘
│  Components    │      │  (multimodal)       │
└────────┬───────┘      └──────────┬──────────┘
         │                         │
         ▼                         ▼
   Cloud Run container      In-memory catalog
   (standalone, <200MB)     (swap for Firestore)
```

## 🧰 Tech Stack

- **Framework**: Next.js 14 App Router, TypeScript (strict), React Server Components
- **AI**: `@google/genai` with Gemini 2.5 Flash (streaming + function calling + vision)
- **UI**: Tailwind CSS, Radix UI primitives (WCAG-AA), lucide-react icons
- **Validation**: Zod for all API boundaries
- **Testing**: Vitest + React Testing Library + **jest-axe** (automated a11y)
- **Deployment**: Docker multi-stage (≈150MB) → Google Cloud Run
- **Security**: env-only secrets, rate-limiting, hardened HTTP headers, HTTPS-only cookies, input sanitization

## 🎯 Judging Criteria Mapping

| Criterion | Evidence |
|---|---|
| **Code Quality** | TypeScript strict, ESLint, Zod validated boundaries, clean separation (lib/components/api), JSDoc comments |
| **Security** | No secrets in client, server-only API keys, rate limiter (`src/lib/rate-limit.ts`), CSP-friendly headers in `next.config.mjs`, Zod input validation |
| **Efficiency** | Next.js standalone output (~150MB Docker), `output: 'standalone'`, lazy images, Tailwind JIT, server components, single-round tool-calling |
| **Testing** | Vitest suites for `products`, `utils`, `rate-limit`, `ProductCard` incl. **jest-axe** accessibility test |
| **Accessibility** | Skip-link, `:focus-visible` rings, ARIA labels, live region on chat, semantic landmarks, prefers-reduced-motion, screen-reader-only labels, Radix WCAG primitives |
| **Google Services** | Gemini 2.5 Flash API, Cloud Run, Cloud Build (implicit in `--source` deploy), and extension points documented for Firestore, Firebase Auth, Cloud Storage, Vertex AI embeddings |

## 🚀 Deploy to Cloud Run (5 minutes)

### 0. Prerequisites

- [Install gcloud CLI](https://cloud.google.com/sdk/docs/install) → `gcloud auth login`
- [Get a Gemini API key](https://aistudio.google.com/apikey) (free tier is fine for the demo)
- A Google Cloud project (Create one: [console.cloud.google.com](https://console.cloud.google.com/))

### 1. Clone + configure

```bash
git clone https://github.com/<you>/shopai.git && cd shopai
cp .env.example .env.local
# put your Gemini key in .env.local
```

### 2. Run locally

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # run all unit + a11y tests
npm run lint
npm run typecheck
```

### 3. Deploy to Cloud Run (one command, builds in Cloud Build)

```bash
export PROJECT_ID=your-project-id
export REGION=asia-south1              # Mumbai
export SERVICE=shopai

gcloud config set project $PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

gcloud run deploy $SERVICE \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --port 8080 \
  --set-env-vars GEMINI_API_KEY=YOUR_KEY,GEMINI_MODEL=gemini-2.5-flash,NODE_ENV=production
```

When it finishes, Cloud Run prints the **public URL** — paste it in the hackathon submission form.

### 4. Push to GitHub

```bash
gh auth login
gh repo create shopai --public --source . --remote origin --push
```

## 🧪 Run the tests

```bash
npm test                      # unit + a11y
npm run typecheck             # TS strict
npm run lint                  # ESLint
```

## 📦 Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Yes (for AI features) | From https://aistudio.google.com/apikey |
| `GEMINI_MODEL` | No (default `gemini-2.5-flash`) | Override model |
| `RATE_LIMIT_RPM` | No (default 60) | Requests/min per IP |
| `PORT` | No (Cloud Run sets 8080) | Server port |

If `GEMINI_API_KEY` is missing, the API falls back to a deterministic catalog search so the demo never breaks.

## 📁 Project structure

```
src/
├── app/
│   ├── api/chat/route.ts      # Gemini function-calling endpoint
│   ├── api/search/route.ts    # Multimodal (photo) search
│   ├── chat/page.tsx          # AI concierge UI
│   ├── dashboard/page.tsx     # Retailer insights
│   ├── products/              # Storefront
│   └── layout.tsx             # Root a11y scaffolding
├── components/
│   ├── ui/                    # Radix-backed primitives
│   ├── product-card.tsx
│   └── nav.tsx
├── lib/
│   ├── gemini.ts              # SDK client + tool schemas + system prompt
│   ├── products.ts            # Seeded catalog + search
│   ├── rate-limit.ts          # In-memory token bucket
│   └── utils.ts
└── test/setup.ts              # Vitest + jest-axe
```

## 🏆 Why this wins

- Every judged dimension is **provable** in the code (tests, headers, strict TS, Zod, jest-axe).
- Feature set matches 2026 state-of-the-art agentic commerce (Google Target/Shopify partnerships).
- Runs on **Cloud Run** with a **standalone Next.js build** — the deployment path the judges recommend.
- Self-contained demo: even without a Gemini key, the UI still works.

Built by **Pranay** for the **AMD Slingshot × Hack2Skill** Retail & E-commerce App challenge.
