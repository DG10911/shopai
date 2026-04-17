'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [placed, setPlaced] = useState(false);
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setPlaced(true);
    clear();
  }

  if (placed) {
    return (
      <section className="container py-20">
        <div className="mx-auto max-w-lg rounded-xl border bg-card p-10 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden />
          <h1 className="mt-4 text-2xl font-bold">Order placed!</h1>
          <p className="mt-2 text-muted-foreground">
            This is a demo checkout — no payment was taken. Thanks for trying ShopAI.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Nothing to check out</h1>
        <p className="mt-2 text-muted-foreground">Add some items to your cart first.</p>
        <Button className="mt-6" asChild>
          <Link href="/products">Shop products</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="container py-10">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden />
        Demo checkout — no real payment is processed.
      </p>

      <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold">Shipping details</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium">Full name</span>
                <input
                  required
                  name="name"
                  className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  autoComplete="name"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Email</span>
                <input
                  required
                  type="email"
                  name="email"
                  className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  autoComplete="email"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium">Address</span>
                <input
                  required
                  name="address"
                  className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  autoComplete="street-address"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">City</span>
                <input
                  required
                  name="city"
                  className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  autoComplete="address-level2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">PIN code</span>
                <input
                  required
                  pattern="[0-9]{6}"
                  name="pin"
                  className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  autoComplete="postal-code"
                />
              </label>
            </div>
          </fieldset>
        </div>

        <aside className="h-fit rounded-xl border bg-card p-6 shadow-sm" aria-label="Order summary">
          <h2 className="text-lg font-semibold">Summary</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {items.map((it) => (
              <li key={it.product.id} className="flex justify-between">
                <span className="line-clamp-1 pr-2">
                  {it.product.name} × {it.quantity}
                </span>
                <span className="font-medium">{formatINR(it.product.price * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{shipping === 0 ? 'Free' : formatINR(shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">GST (18%)</dt>
              <dd>{formatINR(tax)}</dd>
            </div>
            <div className="flex justify-between border-t pt-3 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-bold">{formatINR(total)}</dd>
            </div>
          </dl>
          <Button type="submit" className="mt-6 w-full" size="lg">
            Place order
          </Button>
        </aside>
      </form>
    </section>
  );
}
