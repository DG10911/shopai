'use client';
import { useMemo, useState } from 'react';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PRODUCTS, searchProducts, type Product } from '@/lib/products';
import { Filter, Search, Camera } from 'lucide-react';

const CATEGORIES: Product['category'][] = ['apparel', 'electronics', 'home', 'beauty', 'sports', 'books'];

export default function ProductsPage() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string>('');
  const [sustainable, setSustainable] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  const results = useMemo(() => {
    return searchProducts(q, {
      category: category || undefined,
      sustainable: sustainable || undefined,
    });
  }, [q, category, sustainable]);

  async function onPhoto(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    setLoadingPhoto(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const resp = await fetch('/api/search', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ image: reader.result }),
        });
        const data = await resp.json();
        if (data.query) setQ(data.query);
      } finally {
        setLoadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <section className="container py-10">
      <h1 className="text-3xl font-bold">All products</h1>
      <p className="mt-1 text-muted-foreground">
        Search by text or <strong>upload a photo</strong> — Gemini turns your image into a search query.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="search" className="sr-only">Search products</label>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            id="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. sustainable running shoes under 6000"
            className="pl-10"
          />
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
          <Camera className="h-4 w-4" aria-hidden />
          {loadingPhoto ? 'Analyzing…' : 'Photo search'}
          <input
            type="file"
            accept="image/*"
            onChange={onPhoto}
            className="sr-only"
            aria-label="Upload a photo for visual product search"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filter products">
        <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
        <Button
          variant={category === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCategory('')}
        >
          All
        </Button>
        {CATEGORIES.map((c) => (
          <Button
            key={c}
            variant={category === c ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
          >
            {c}
          </Button>
        ))}
        <Button
          variant={sustainable ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSustainable((v) => !v)}
          aria-pressed={sustainable}
        >
          Sustainable only
        </Button>
        <span className="ml-auto">
          <Badge variant="secondary">{results.length} results</Badge>
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {results.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {results.length === 0 && (
          <p className="col-span-full rounded-md border bg-muted p-6 text-center text-sm text-muted-foreground">
            No products match — try a different search or remove filters.
          </p>
        )}
      </div>
    </section>
  );
}
