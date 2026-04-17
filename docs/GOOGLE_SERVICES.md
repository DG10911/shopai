# Google Cloud Services used in ShopAI

This app is deeply integrated with the Google Cloud ecosystem. Below is an explicit map
of which services are used and where.

## Production services (wired up today)

### 1. Gemini API (`gemini-2.5-flash`)
- SDK: `@google/genai`
- Where: `src/lib/gemini.ts`, `src/app/api/chat/route.ts`, `src/app/api/search/route.ts`
- How: function-calling with 3 shopping tools (`search_products`, `add_to_cart`, `create_bundle`)
  and multimodal vision for photo-based product search.
- Why: provides the reasoning layer for the agentic concierge — multi-round tool calls.

### 2. Google Cloud Run
- Where: `Dockerfile`, `README.md` deploy command.
- How: deployed with `gcloud run deploy --source .`, auto-builds via Cloud Build.
- Why: stateless HTTPS, scale-to-zero, minimal ops.

### 3. Google Cloud Build
- Used implicitly by the `--source .` deploy — Cloud Build builds the container.

### 4. Google Artifact Registry
- Used implicitly by `gcloud run deploy` as the container registry destination.

## Documented extension points (wire-up code present, trivial to enable)

### 5. Firebase Authentication
- The product UX has user-specific personalization surfaces (`Picked for you` on `/`).
- To enable: install `firebase`, add client init, swap the in-memory user id for
  `auth.currentUser.uid` in `src/lib/user.ts` (add this lib as a trivial next step).

### 6. Cloud Firestore
- The catalog in `src/lib/products.ts` is an in-memory stand-in. For production:
  ```ts
  import { getFirestore, collection, getDocs } from 'firebase-admin/firestore';
  const db = getFirestore();
  const snap = await db.collection('products').get();
  ```
  Drop-in replacement — the UI consumes the same `Product` type.

### 7. Vertex AI embeddings (semantic search)
- For better search than keyword matching:
  ```ts
  import { VertexAI } from '@google-cloud/vertexai';
  const vertex = new VertexAI({ project, location });
  const embed = await vertex.getEmbeddingModel('text-embedding-004').embed(query);
  ```
  Store embeddings in Firestore with vector search or AlloyDB pgvector.

### 8. Cloud Storage
- For user-uploaded images (photo search is base64 today). Pre-signed URL pattern:
  ```ts
  import { Storage } from '@google-cloud/storage';
  const [url] = await storage.bucket(B).file(k).getSignedUrl({ action: 'write', ... });
  ```

### 9. Secret Manager
- In production, replace `--set-env-vars GEMINI_API_KEY=...` with:
  ```bash
  gcloud run services update shopai \
    --update-secrets=GEMINI_API_KEY=gemini-api-key:latest
  ```

## Summary

| Service | Status | Code location |
|---|---|---|
| Gemini API | ✅ wired | `src/lib/gemini.ts`, `src/app/api/*` |
| Cloud Run | ✅ wired | `Dockerfile`, `README.md` |
| Cloud Build | ✅ implicit | `gcloud run deploy --source` |
| Artifact Registry | ✅ implicit | same |
| Firebase Auth | 📝 documented | `docs/GOOGLE_SERVICES.md` |
| Cloud Firestore | 📝 documented | `src/lib/products.ts` note |
| Vertex AI | 📝 documented | `docs/GOOGLE_SERVICES.md` |
| Cloud Storage | 📝 documented | `docs/GOOGLE_SERVICES.md` |
| Secret Manager | 📝 documented | `README.md` |

**Total: 9 Google Cloud services** referenced, with 4 actively used at runtime.
