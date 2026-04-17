import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/product-card';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { PRODUCTS, getProduct } from '@/lib/products';
import { formatINR } from '@/lib/utils';
import { Leaf, Star, ArrowLeft } from 'lucide-react';

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProduct(params.id);
  if (!product) notFound();

  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <article className="container py-10">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to all products
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
        </div>

        <div>
          {product.sustainable && (
            <Badge variant="success" className="gap-1">
              <Leaf className="h-3 w-3" aria-hidden />
              Sustainable
            </Badge>
          )}
          <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-muted-foreground">{product.description}</p>

          <div className="mt-4 flex items-center gap-4">
            <span className="text-3xl font-bold">{formatINR(product.price)}</span>
            <span className="flex items-center gap-1 text-sm" aria-label={`Rated ${product.rating} out of 5`}>
              <Star className="h-4 w-4 fill-current text-amber-500" aria-hidden />
              {product.rating} · {product.stock} in stock
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <AddToCartButton product={product} />
            <Button size="lg" variant="outline" asChild>
              <Link href="/chat">Ask the AI concierge</Link>
            </Button>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Category</dt>
              <dd className="font-medium capitalize">{product.category}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Tags</dt>
              <dd className="font-medium">{product.tags.join(', ')}</dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold">You might also like</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
