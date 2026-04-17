'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { Product } from './products';

export type CartItem = { product: Product; quantity: number };
type CartState = { items: CartItem[] };

type CartCtx = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  add: (p: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  toast: string | null;
  dismissToast: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = 'shopai-cart-v1';

function readStorage(): CartState {
  if (typeof window === 'undefined') return { items: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && 'items' in parsed && Array.isArray((parsed as CartState).items)) {
      return parsed as CartState;
    }
  } catch {
    /* ignore */
  }
  return { items: [] };
}

function writeStorage(state: CartState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage blocked — non-fatal */
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setItems(readStorage().items);
  }, []);

  // Persist on every change (after hydration)
  useEffect(() => {
    writeStorage({ items });
  }, [items]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const add = useCallback((p: Product, qty = 1) => {
    setItems((cur) => {
      const existing = cur.find((x) => x.product.id === p.id);
      if (existing) {
        return cur.map((x) => (x.product.id === p.id ? { ...x, quantity: x.quantity + qty } : x));
      }
      return [...cur, { product: p, quantity: qty }];
    });
    setToast(`Added "${p.name}" to cart`);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((cur) => cur.filter((x) => x.product.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      remove(id);
      return;
    }
    setItems((cur) => cur.map((x) => (x.product.id === id ? { ...x, quantity: qty } : x)));
  }, [remove]);

  const clear = useCallback(() => {
    setItems([]);
    setToast('Cart cleared');
  }, []);

  const value = useMemo<CartCtx>(() => {
    const itemCount = items.reduce((s, x) => s + x.quantity, 0);
    const subtotal = items.reduce((s, x) => s + x.product.price * x.quantity, 0);
    return { items, itemCount, subtotal, add, remove, setQty, clear, toast, dismissToast: () => setToast(null) };
  }, [items, add, remove, setQty, clear, toast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>');
  return ctx;
}
