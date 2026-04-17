'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, itemCount, subtotal, setQty, remove, clear } = useCart();

  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <section className="container py-20">
        <div className="mx-auto max-w-lg rounded-xl border bg-card p-10 text-center shadow-sm">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden />
          <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">
            Ask our AI concierge for gift ideas, or browse the catalog.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link href="/products">Shop products</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/chat">Ask the AI</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your cart</h1>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          aria-label="Clear cart"
        >
          Clear cart
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4" aria-label="Cart items">
          {items.map((item) => (
            <li
              key={item.product.id}
              className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.product.image}
                alt={item.product.name}
                className="h-20 w-20 rounded-md object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.product.id}`}
                  className="line-clamp-1 font-semibold hover:underline"
                >
                  {item.product.name}
                </Link>
                <p className="text-sm text-muted-foreground capitalize">{item.product.category}</p>
                <p className="mt-1 text-sm font-medium">{formatINR(item.product.price)}</p>
              </div>
              <div
                className="flex items-center gap-1 rounded-md border bg-background"
                role="group"
                aria-label={`Quantity for ${item.product.name}`}
              >
                <button
                  type="button"
                  onClick={() => setQty(item.product.id, item.quantity - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-l-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Decrease quantity of ${item.product.name}`}
                >
                  <Minus className="h-4 w-4" aria-hidden />
                </button>
                <span className="w-8 text-center text-sm font-medium" aria-live="polite">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(item.product.id, item.quantity + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-r-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Increase quantity of ${item.product.name}`}
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className="w-24 text-right font-semibold">
                {formatINR(item.product.price * item.quantity)}
              </div>
              <button
                type="button"
                onClick={() => remove(item.product.id)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Remove ${item.product.name} from cart`}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-xl border bg-card p-6 shadow-sm" aria-label="Order summary">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Items ({itemCount})</dt>
              <dd className="font-medium">{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="font-medium">
                {shipping === 0 ? <span className="text-emerald-600">Free</span> : formatINR(shipping)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">GST (18%)</dt>
              <dd className="font-medium">{formatINR(tax)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t pt-3 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-bold">{formatINR(total)}</dd>
            </div>
          </dl>
          <Button className="mt-6 w-full" size="lg" asChild>
            <Link href="/checkout" aria-label="Proceed to checkout">
              Checkout
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Secure checkout · Free shipping on orders over ₹999
          </p>
        </aside>
      </div>
    </section>
  );
}
