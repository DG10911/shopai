'use client';
import { useCart } from '@/lib/cart';
import { CheckCircle2 } from 'lucide-react';

export function CartToast() {
  const { toast } = useCart();
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
    >
      {toast && (
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-medium shadow-lg fade-up">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
