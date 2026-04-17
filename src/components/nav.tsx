import Link from 'next/link';
import { Sparkles, ShoppingBag, LayoutDashboard } from 'lucide-react';
import { CartIcon } from './cart-icon';

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <nav aria-label="Primary" className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg" aria-label="ShopAI home">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden />
          <span>ShopAI</span>
        </Link>
        <ul className="flex items-center gap-1 sm:gap-2">
          <li>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Shop</span>
            </Link>
          </li>
          <li>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">AI Concierge</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Retailer</span>
            </Link>
          </li>
          <li>
            <CartIcon />
          </li>
        </ul>
      </nav>
    </header>
  );
}
