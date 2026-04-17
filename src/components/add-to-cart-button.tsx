'use client';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart';
import type { Product } from '@/lib/products';

export function AddToCartButton({ product, size = 'lg' }: { product: Product; size?: 'sm' | 'lg' | 'default' }) {
  const { add } = useCart();
  return (
    <Button size={size} onClick={() => add(product, 1)} aria-label={`Add ${product.name} to cart`}>
      Add to cart
    </Button>
  );
}
