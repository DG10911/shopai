# Security

ShopAI treats security as a first-class concern. This doc summarizes the controls
implemented in this codebase.

## Secrets management
- **Zero secrets in code**. `GEMINI_API_KEY` is read only from `process.env` on the server.
- `.env*` files are gitignored.
- On Cloud Run, keys are passed via `--set-env-vars` or (preferably) Secret Manager.
- API key is never referenced in any client component — function-calling and image analysis
  happen exclusively in server route handlers (`src/app/api/*`).

## Input validation
- All API boundaries validate with **Zod** (`src/app/api/chat/route.ts`, `src/app/api/search/route.ts`).
- Chat payload is capped at 30 messages / 4000 chars each; image payloads at 2 MB.
- Malformed JSON returns 400 without crashing the route.

## Rate limiting
- In-memory token-bucket limiter (`src/lib/rate-limit.ts`, 60 rpm/IP by default).
- Returns 429 with `Retry-After` header on breach.
- For production, swap for Firestore/Memorystore-backed limiter.

## HTTP hardening
See `next.config.mjs`:
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(self), microphone=(self)`
- `poweredByHeader: false` (removes `X-Powered-By: Next.js`)

## Server-only AI calls
- Every Gemini call happens server-side. The client only sees final text + tool results.
- This prevents key exfiltration and prompt-injection reaching the model with elevated privileges.

## Dependency hygiene
- `npm ci` in CI guarantees reproducible installs.
- No transitive deps pull in known vulnerable packages (verified on Node 20 LTS).

## Reporting
If you find a security issue, email the maintainer listed in `package.json`. Please
don't file public GitHub issues for sensitive reports.
