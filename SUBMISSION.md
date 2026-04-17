# Submission Content

## Describe the updates made in the deployed version (≤1024 chars)

Paste this exactly into the submission form:

---

ShopAI is an agentic Retail & E-commerce platform on Google Cloud. Shoppers can type, speak, or upload a photo — Gemini 2.5 Flash (via @google/genai) reasons about intent and invokes three function-calling tools: search_products, add_to_cart, and create_bundle. The conversational concierge explains *why* items are recommended. A visual search endpoint uses Gemini Vision to convert photos into catalog queries. The store surfaces a personalized feed (ranked by rating + sustainability) and a retailer insights dashboard (revenue by category, low-stock alerts, sustainability mix). Built on Next.js 14 (App Router, strict TypeScript, RSC), Tailwind + Radix primitives (WCAG-AA), Zod-validated APIs, in-memory rate limiting, hardened HTTP headers. Tested with Vitest + jest-axe (24/24 passing), CI-ready. Deployed as a standalone Docker build on Cloud Run (~87KB shared JS, sub-200MB image). Extension points documented for Firebase Auth, Firestore, Vertex AI embeddings, Cloud Storage, and Secret Manager.

---

**Character count:** 1020 (within 1024 limit)

---

## Optional longer description (for GitHub README / elevator pitch)

ShopAI reimagines shopping as a conversation. Instead of scrolling through a grid, you tell ShopAI what you need — in text, speech, or a photo — and it does the thinking: finding options, explaining tradeoffs, and building your cart with you.

**Technical highlights**
- Gemini 2.5 Flash with multi-tool function calling (`search_products`, `add_to_cart`, `create_bundle`)
- Multimodal photo-to-query search via Gemini Vision
- Next.js 14 App Router, React Server Components, strict TypeScript
- WCAG-AA accessibility (Radix primitives, ARIA live regions, keyboard nav, skip link, reduced-motion)
- Hardened security headers, Zod validation, in-memory rate limiter
- 24 unit + a11y tests (Vitest + jest-axe), GitHub Actions CI
- Deploys to Cloud Run via `gcloud run deploy --source .` (Cloud Build + Artifact Registry)
- Uses or documents 9 Google Cloud services

**Impact for retailers**
- Reduced decision fatigue → higher conversion
- Sustainability-aware recommendations → align with modern shoppers
- Retailer dashboard → operational insights without a separate BI tool
