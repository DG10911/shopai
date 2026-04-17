import { NextRequest } from 'next/server';
import { z } from 'zod';
import { adjustStock } from '@/lib/analytics';
import { getProduct } from '@/lib/products';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  productId: z.string().min(1).max(32),
  delta: z.number().int().min(-1000).max(1000),
});

export async function POST(req: NextRequest) {
  const rl = rateLimit(getClientIp(req));
  if (!rl.ok) return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return new Response('Invalid JSON', { status: 400 }); }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });
  }

  const product = getProduct(parsed.data.productId);
  if (!product) return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });

  const newStock = adjustStock(parsed.data.productId, parsed.data.delta);
  return Response.json({ ok: true, productId: parsed.data.productId, newStock });
}
