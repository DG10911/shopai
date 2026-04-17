import { NextRequest } from 'next/server';
import { z } from 'zod';
import { genai, MODEL_NAME } from '@/lib/gemini';
import { catalogSummary, topSellers, lowStockSkus, computeKPIs } from '@/lib/analytics';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z
  .object({ focus: z.string().max(500).optional() })
  .default({});

function fallbackInsights(): string[] {
  const kpi = computeKPIs('30d');
  const sellers = topSellers('30d', 2);
  const low = lowStockSkus().slice(0, 2);
  const out: string[] = [];
  if (sellers[0]) {
    out.push(
      `Your best seller "${sellers[0].product.name}" moved ${sellers[0].units} units in 30 days — consider a bundle with a complementary item to lift AOV.`
    );
  }
  if (low[0]) {
    out.push(
      `"${low[0].name}" is down to ${low[0].stock} units. At current velocity you risk stock-out — restock at least 50.`
    );
  }
  if (kpi.sustainablePct < 40) {
    out.push(
      `Only ${kpi.sustainablePct}% of your catalog is tagged sustainable. Adding eco SKUs can capture the ~30% of Indian shoppers who filter for it.`
    );
  } else {
    out.push(
      `Sustainable mix is strong at ${kpi.sustainablePct}% — promote it on the homepage hero to convert eco-conscious shoppers.`
    );
  }
  return out.slice(0, 3);
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(getClientIp(req));
  if (!rl.ok) return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });

  let body: unknown = {};
  try { body = await req.json(); }
  catch { /* empty body ok */ }
  const parsed = BodySchema.safeParse(body);
  const focus = parsed.success ? parsed.data.focus : undefined;

  const summary = catalogSummary();

  if (!genai) {
    return Response.json({ insights: fallbackInsights(), source: 'fallback' });
  }

  try {
    const prompt =
      `You are a retail operations analyst. Given this catalog snapshot, produce 3 concise, actionable insights ` +
      `for the store owner. Each insight should be 1-2 sentences, start with a verb, and reference specific numbers/products from the data. ` +
      `Return ONLY a JSON array of 3 strings, no other text.\n\n` +
      `Catalog snapshot: ${summary}\n` +
      (focus ? `Focus area: ${focus}\n` : '') +
      `Example output: ["Push …", "Restock …", "Launch …"]`;

    const resp = await genai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.4 },
    });
    const text = (resp.text ?? '').trim();
    // Strip markdown fences if the model added them.
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const arr = JSON.parse(cleaned);
    if (!Array.isArray(arr) || arr.some((x) => typeof x !== 'string')) throw new Error('bad shape');
    return Response.json({ insights: arr.slice(0, 3), source: 'gemini' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[insights] error', err);
    return Response.json({ insights: fallbackInsights(), source: 'fallback' });
  }
}
