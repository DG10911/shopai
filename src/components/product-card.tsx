'use client';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils';
import type { Product } from '@/lib/products';
import { Leaf, Star } from 'lucide-react';
import { useCart } from '@/lib/cart';

export function ProductCard({ product, onAdd }: { product: Product; onAdd?: (p: Product) => void }) {
  const { add } = useCart();
  const handleAdd = () => {
    if (onAdd) onAdd(product);
    else add(product, 1);
  };
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link
        href={`/products/${product.id}`}
        className="block"
        aria-label={`View details for ${product.name}`}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.sustainable && (
            <Badge variant="success" className="absolute left-3 top-3 gap-1">
              <Leaf className="h-3 w-3" aria-hidden />
              <span>Eco</span>
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <h3 className="line-clamp-1 font-semibold">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold">{formatINR(product.price)}</span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground" aria-label={`Rated ${product.rating} out of 5`}>
            <Star className="h-4 w-4 fill-current text-amber-500" aria-hidden />
            {product.rating}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          size="sm"
          className="w-full"
          onClick={handleAdd}
          aria-label={`Add ${product.name} to cart`}
        >
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  );
}
