'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/product-card';
import { PRODUCTS, type Product } from '@/lib/products';
import { useCart } from '@/lib/cart';
import { Sparkles, Send, Mic, Camera, Bot, User, Loader2, X } from 'lucide-react';

type Msg = { role: 'user' | 'model'; content: string; image?: string; products?: Product[] };
type ToolResult = { name: string; result: unknown };

const SUGGESTIONS = [
  'Birthday gift for my mom who loves gardening, under ₹2000',
  'Build me a home-office setup under ₹20000',
  'Sustainable running shoes for marathon training',
  'Complete the look for a linen summer shirt',
];

export default function ChatPage() {
  const { add } = useCart();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'model',
      content:
        "Hi! I'm ShopAI — your shopping concierge. Tell me what you're looking for, or drop a photo of something you love. Say \"add to cart\" after a suggestion and I'll add it for you.",
    },
  ]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed && !image) return;
    const userMsg: Msg = { role: 'user', content: trimmed || '(image)', image: image ?? undefined };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setImage(null);
    setLoading(true);
    if (liveRef.current) liveRef.current.textContent = 'Thinking…';
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content, image: m.image })) }),
      });
      const data = await resp.json();

      // If the AI used the add_to_cart tool, actually add the items to the real cart.
      if (Array.isArray(data.tools)) {
        for (const t of data.tools as ToolResult[]) {
          if (t.name !== 'add_to_cart' || !t.result) continue;
          const r = t.result as { ok?: boolean; added?: { id?: string; quantity?: number } };
          if (r.ok && r.added?.id) {
            const product = PRODUCTS.find((p) => p.id === r.added!.id);
            if (product) add(product, Math.max(1, r.added.quantity ?? 1));
          }
        }
      }

      setMessages((m) => [
        ...m,
        {
          role: 'model',
          content: data.text ?? (data.error ? `Error: ${data.error}` : 'No response.'),
          products: Array.isArray(data.products) ? data.products : undefined,
        },
      ]);
      if (liveRef.current) liveRef.current.textContent = 'Reply received.';
    } catch (e) {
      setMessages((m) => [...m, { role: 'model', content: 'Sorry — network error. Try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  function onFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setImage(typeof r.result === 'string' ? r.result : null);
    r.readAsDataURL(file);
  }

  function startVoice() {
    const SR = (window as unknown as { webkitSpeechRecognition?: any; SpeechRecognition?: any }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;
    if (!SR) {
      alert('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    setListening(true);
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript as string;
      setInput((v) => (v ? `${v} ${transcript}` : transcript));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
  }

  return (
    <section className="container flex h-[calc(100dvh-4rem)] flex-col py-4">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold">AI Concierge</h1>
          <p className="text-sm text-muted-foreground">
            Powered by Gemini with function-calling: <Badge variant="secondary">search_products</Badge>{' '}
            <Badge variant="secondary">add_to_cart</Badge> <Badge variant="secondary">create_bundle</Badge>
          </p>
        </div>
      </header>

      <div ref={liveRef} role="status" aria-live="polite" className="sr-only" />

      <div
        ref={scrollRef}
        className="mt-4 flex-1 space-y-4 overflow-y-auto rounded-xl border bg-card p-4"
        aria-label="Chat messages"
      >
        {messages.map((m, i) => (
          <div key={i} className={`fade-up flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
              aria-hidden
            >
              {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={`max-w-[80%] space-y-2 ${m.role === 'user' ? 'items-end text-right' : ''}`}>
              {m.image && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={m.image} alt="User uploaded" className="max-h-48 rounded-md border" />
              )}
              <div
                className={`rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                  m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                {m.content.split('\n').map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
              {m.products && m.products.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {m.products.slice(0, 6).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Thinking…
          </div>
        )}
        {messages.length <= 1 && !loading && (
          <div className="pt-2">
            <p className="text-sm font-medium text-muted-foreground">Try asking:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border bg-background px-3 py-1 text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {image && (
        <div className="mt-3 flex items-center gap-2 rounded-md border bg-muted p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Attached" className="h-12 w-12 rounded object-cover" />
          <span className="text-sm text-muted-foreground">Image attached — it'll be sent with your next message.</span>
          <Button size="icon" variant="ghost" className="ml-auto" onClick={() => setImage(null)} aria-label="Remove image">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-3 flex items-center gap-2"
        aria-label="Send a message"
      >
        <label htmlFor="chat-input" className="sr-only">Ask ShopAI</label>
        <Input
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything — ShopAI will reason and find products"
          disabled={loading}
          autoComplete="off"
        />
        <label className="inline-flex cursor-pointer items-center justify-center rounded-md border bg-background p-2 hover:bg-accent">
          <Camera className="h-4 w-4" aria-hidden />
          <span className="sr-only">Attach image</span>
          <input type="file" accept="image/*" onChange={onFile} className="sr-only" />
        </label>
        <Button
          type="button"
          variant={listening ? 'default' : 'outline'}
          size="icon"
          onClick={startVoice}
          aria-label={listening ? 'Listening' : 'Start voice input'}
        >
          <Mic className={`h-4 w-4 ${listening ? 'animate-pulse' : ''}`} aria-hidden />
        </Button>
        <Button type="submit" disabled={loading || (!input.trim() && !image)}>
          <Send className="h-4 w-4" aria-hidden />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </section>
  );
}
