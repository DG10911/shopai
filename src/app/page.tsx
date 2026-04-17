import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import { PRODUCTS } from '@/lib/products';
import { Sparkles, Camera, Mic, ShoppingBag, Zap, Shield, Leaf } from 'lucide-react';

export default function HomePage() {
  // "Personalized" feed: in a real app this reads Firestore user history.
  // For the demo we surface top-rated + sustainable items first.
  const featured = [...PRODUCTS].sort((a, b) => {
    const bias = (b.sustainable ? 0.1 : 0) - (a.sustainable ? 0.1 : 0);
    return b.rating - a.rating + bias;
  }).slice(0, 8);

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient">
        <div className="container flex flex-col items-center gap-6 py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-1 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            Powered by Gemini 2.5 Flash on Google Cloud
          </span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Shopping, reimagined by an{' '}
            <span className="text-primary">agentic AI concierge</span>.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Type, speak, or snap a photo. ShopAI understands what you need, reasons about fit and
            budget, and builds your cart with you — not for you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/chat">
                <Sparkles className="h-4 w-4" aria-hidden />
                Try the AI Concierge
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/products">
                <ShoppingBag className="h-4 w-4" aria-hidden />
                Browse the store
              </Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <li className="inline-flex items-center gap-2"><Camera className="h-4 w-4" aria-hidden /> Photo search</li>
            <li className="inline-flex items-center gap-2"><Mic className="h-4 w-4" aria-hidden /> Voice input</li>
            <li className="inline-flex items-center gap-2"><Zap className="h-4 w-4" aria-hidden /> Streaming replies</li>
            <li className="inline-flex items-center gap-2"><Shield className="h-4 w-4" aria-hidden /> WCAG-AA accessible</li>
            <li className="inline-flex items-center gap-2"><Leaf className="h-4 w-4" aria-hidden /> Sustainability-aware</li>
          </ul>
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <h2 className="text-2xl font-bold sm:text-3xl">Six ways ShopAI changes the shopping loop</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { t: 'Multimodal AI search', d: 'Describe it, speak it, or upload a photo. Gemini understands intent.' },
            { t: 'Agentic cart building', d: 'Function-calling tools let the concierge search, add, and bundle.' },
            { t: 'Smart bundles', d: '"Complete-the-look" — Gemini reasons about complementary products.' },
            { t: 'Personalized feed', d: 'Homepage re-orders based on your history and preferences.' },
            { t: 'Voice-first accessibility', d: 'Full keyboard nav, screen-reader labels, reduced-motion support.' },
            { t: 'Retailer insights', d: 'Dashboard with demand, top categories, and sustainability mix.' },
          ].map((f) => (
            <div key={f.t} className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Personalized picks */}
      <section className="container py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Picked for you</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ranked by quality, rating, and sustainability.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/products">View all</Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
