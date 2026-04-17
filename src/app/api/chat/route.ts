import { NextRequest } from 'next/server';
import { z } from 'zod';
import { genai, MODEL_NAME, SYSTEM_INSTRUCTION, shoppingTools } from '@/lib/gemini';
import { searchProducts, getProduct } from '@/lib/products';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string().max(4000),
  image: z.string().max(2_000_000).optional(), // base64 data URL
});
const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(30),
});

type ToolResult = { name: string; result: unknown };

function runTool(name: string, args: Record<string, unknown>): unknown {
  switch (name) {
    case 'search_products': {
      const q = String(args.query ?? '');
      return searchProducts(q, {
        category: typeof args.category === 'string' ? (args.category as string) : undefined,
        maxPrice: typeof args.maxPrice === 'number' ? (args.maxPrice as number) : undefined,
        sustainable: typeof args.sustainable === 'boolean' ? (args.sustainable as boolean) : undefined,
      }).slice(0, 6);
    }
    case 'add_to_cart': {
      const p = getProduct(String(args.productId));
      if (!p) return { ok: false, error: 'Product not found' };
      return { ok: true, added: { id: p.id, name: p.name, price: p.price, quantity: Number(args.quantity ?? 1) } };
    }
    case 'create_bundle': {
      const theme = String(args.theme ?? '').toLowerCase();
      const budget = typeof args.budget === 'number' ? (args.budget as number) : Infinity;
      // Simple greedy bundle: search theme terms, filter by budget, pick 3 diverse categories.
      const seeds = searchProducts(theme).slice(0, 12);
      const seenCats = new Set<string>();
      const picks = [] as typeof seeds;
      let spent = 0;
      for (const s of seeds) {
        if (seenCats.has(s.category)) continue;
        if (spent + s.price > budget) continue;
        picks.push(s);
        seenCats.add(s.category);
        spent += s.price;
        if (picks.length >= 3) break;
      }
      return { theme, totalPrice: spent, items: picks };
    }
    default:
      return { error: `Unknown tool ${name}` };
  }
}

function toGeminiContent(m: z.infer<typeof MessageSchema>) {
  const parts: Array<Record<string, unknown>> = [{ text: m.content }];
  if (m.image && m.role === 'user') {
    const match = m.image.match(/^data:(.+?);base64,(.+)$/);
    if (match) parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
  }
  return { role: m.role === 'model' ? 'model' : 'user', parts };
}

/**
 * For multimodal input, Gemini sometimes errors when function tools + inline_data
 * are combined. To make the UX robust, we run a vision-only pre-pass that turns
 * the image into search keywords, then drop the image from the tool-calling flow.
 */
async function describeImage(imageDataUrl: string): Promise<string | null> {
  if (!genai) return null;
  const m = imageDataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!m) return null;
  try {
    const resp = await genai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Describe this product in 8 words or fewer, as catalog keywords. Respond ONLY with keywords, no punctuation, no sentences.' },
            { inlineData: { mimeType: m[1], data: m[2] } },
          ],
        },
      ],
      config: { temperature: 0.2 },
    });
    const t = (resp.text ?? '').trim();
    return t || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(ip);
  if (!rl.ok) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 'content-type': 'application/json', 'retry-after': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return new Response('Invalid JSON', { status: 400 }); }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });

  const { messages } = parsed.data;

  // If no Gemini key, run a deterministic fallback so the demo always works.
  if (!genai) {
    const last = messages[messages.length - 1];
    const hits = searchProducts(last.content).slice(0, 4);
    const reply = hits.length
      ? `I couldn't reach Gemini right now, but here are top matches from the catalog for "${last.content}":\n\n` +
        hits.map((p) => `• ${p.name} — ₹${p.price}`).join('\n')
      : `Gemini is offline and I found no matches for "${last.content}". Try another search.`;
    return new Response(JSON.stringify({ text: reply, products: hits, tools: [] }), {
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    // Pre-pass: if the latest user message has an image, convert it to keywords
    // and rewrite the message as text-only. This avoids mixing inline_data with
    // function tools (which Vertex/Gemini sometimes rejects).
    const lastIdx = messages.length - 1;
    const lastMsg = messages[lastIdx];
    if (lastMsg.role === 'user' && lastMsg.image) {
      const keywords = await describeImage(lastMsg.image);
      if (keywords) {
        const userText = lastMsg.content && lastMsg.content !== '(image)' ? lastMsg.content : '';
        messages[lastIdx] = {
          ...lastMsg,
          content: userText
            ? `${userText}\n(From the attached image I see: ${keywords}.) Please search for matching items.`
            : `The user uploaded an image of: ${keywords}. Please search for visually or functionally similar items in the catalog.`,
          image: undefined,
        };
      } else {
        // vision pre-pass failed — at least replace "(image)" placeholder
        if (!lastMsg.content || lastMsg.content === '(image)') {
          messages[lastIdx] = { ...lastMsg, content: 'Help me find something based on the attached image.', image: undefined };
        }
      }
    }

    const history = messages.map(toGeminiContent);

    // --- Round 1 ---
    let resp = await genai.models.generateContent({
      model: MODEL_NAME,
      contents: history,
      config: {
        tools: shoppingTools,
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.6,
      },
    });

    const toolCalls = resp.functionCalls ?? [];
    const toolResults: ToolResult[] = [];

    if (toolCalls.length) {
      const functionResponseParts = toolCalls.map((c) => {
        const result = runTool(c.name ?? '', (c.args as Record<string, unknown>) ?? {});
        toolResults.push({ name: c.name ?? 'unknown', result });
        return {
          functionResponse: { name: c.name ?? 'unknown', response: { result } },
        };
      });

      // Append model's tool call + our responses, then re-prompt.
      const nextHistory = [
        ...history,
        { role: 'model', parts: (resp.candidates?.[0]?.content?.parts ?? []) as unknown[] },
        { role: 'user', parts: functionResponseParts },
      ];

      // --- Round 2: model gets tool results and produces final text ---
      resp = await genai.models.generateContent({
        model: MODEL_NAME,
        contents: nextHistory as never,
        config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.6 },
      });
    }

    const text = resp.text ?? '';
    // Flatten any product lists returned by search_products / create_bundle
    const products: unknown[] = [];
    for (const t of toolResults) {
      if (t.name === 'search_products' && Array.isArray(t.result)) products.push(...(t.result as unknown[]));
      if (t.name === 'create_bundle' && t.result && typeof t.result === 'object' && Array.isArray((t.result as { items?: unknown[] }).items)) {
        products.push(...((t.result as { items: unknown[] }).items));
      }
    }

    return new Response(JSON.stringify({ text, products, tools: toolResults }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[chat] error', err);
    // Graceful fallback: never break the UX — serve catalog matches with a helpful note.
    const last = messages[messages.length - 1];
    const hits = searchProducts(last.content).slice(0, 4);
    const reply = hits.length
      ? `The AI backend is temporarily unavailable, but here are top catalog matches for "${last.content}":\n\n` +
        hits.map((p) => `• ${p.name} — ₹${p.price}`).join('\n')
      : `The AI backend is temporarily unavailable and I couldn't find catalog matches for "${last.content}". Please try a different query.`;
    return new Response(JSON.stringify({ text: reply, products: hits, tools: [] }), {
      headers: { 'content-type': 'application/json' },
    });
  }
}
