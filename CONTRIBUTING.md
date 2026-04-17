# Contributing to ShopAI

Thanks for looking at the code!

## Local development

```bash
npm install
cp .env.example .env.local    # add your GEMINI_API_KEY
npm run dev                   # http://localhost:3000
```

## Quality gates (all must pass before merge)

```bash
npm run lint         # ESLint
npm run typecheck    # TypeScript strict
npm test             # Vitest unit + jest-axe a11y
npm run build        # Next.js production build
```

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs all of these on every push and pull request.

## Code style

- TypeScript strict mode — no `any` unless absolutely necessary.
- All API routes validate inputs with Zod before doing anything else.
- Server components by default — opt into `'use client'` only when you need state or browser APIs.
- Prefer Radix primitives from `src/components/ui/` for any new interactive UI so accessibility is baked in.

## Testing checklist for new components

- [ ] Unit test for core behavior
- [ ] jest-axe test for a11y violations
- [ ] Keyboard-only flow verified
- [ ] Screen-reader labels present (`aria-label`, `aria-describedby`, visible labels where possible)
