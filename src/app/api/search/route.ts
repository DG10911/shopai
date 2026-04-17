import { NextRequest } from 'next/server';
import { z } from 'zod';
import { searchProducts } from '@/lib/products';
import { genai, MODEL_NAME } from '@/lib/gemini';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  query: z.string().max(400).optional().default(''),
  image: z.string().max(2_000_000).optional(), // base64 data URL, for photo search
});

export async function POST(req: NextRequest) {
  const rl = rateLimit(getClientIp(req));
  if (!rl.ok) return new Response('rate limit', { status: 429 });

  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return new Response('bad request', { status: 400 });

  let query = body.data.query.trim();

  // If an image is provided and Gemini is available, use multimodal search:
  // Gemini describes the image → we use the description as a search query.
  if (body.data.image && genai) {
    const m = body.data.image.match(/^data:(.+?);base64,(.+)$/);
    if (m) {
      try {
        const resp = await genai.models.generateContent({
          model: MODEL_NAME,
          contents: [
            {
              role: 'user',
              parts: [
                { text: 'Describe this product in 6 words or fewer, suitable for catalog search. Respond with only the keywords, no punctuation.' },
                { inlineData: { mimeType: m[1], data: m[2] } },
              ],
            },
          ],
          config: { temperature: 0.2 },
        });
        const described = (resp.text ?? '').trim();
        if (described) query = `${query} ${described}`.trim();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[search] multimodal failed, falling back to text', err);
      }
    }
  }

  const results = searchProducts(query).slice(0, 12);
  return new Response(JSON.stringify({ query, results }), {
    headers: { 'content-type': 'application/json' },
  });
}
