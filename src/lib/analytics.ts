// Retailer analytics engine. Uses the catalog + a deterministic seeded RNG to
// synthesize realistic time-series data, then supports mutable stock deltas
// (in-memory) so the dashboard's Restock buttons actually update KPIs.

import { PRODUCTS, type Product } from './products';

export type TimeRange = '7d' | '30d' | '90d';

// In-memory stock deltas applied on top of the catalog baseline.
const stockDeltas = new Map<string, number>();

// Deterministic RNG so charts are stable across SSR/CSR.
function rng(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export function effectiveStock(p: Product): number {
  const delta = stockDeltas.get(p.id) ?? 0;
  return Math.max(0, p.stock + delta);
}

export function adjustStock(productId: string, delta: number): number {
  const cur = stockDeltas.get(productId) ?? 0;
  stockDeltas.set(productId, cur + delta);
  const p = PRODUCTS.find((x) => x.id === productId);
  return p ? effectiveStock(p) : 0;
}

export function rangeDays(range: TimeRange): number {
  return range === '7d' ? 7 : range === '30d' ? 30 : 90;
}

/** Synthesized daily revenue for the given range. Deterministic per product. */
export function revenueSeries(range: TimeRange, categoryFilter?: string) {
  const days = rangeDays(range);
  const out: Array<{ date: string; revenue: number }> = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    let rev = 0;
    for (const p of PRODUCTS) {
      if (categoryFilter && p.category !== categoryFilter) continue;
      // Deterministic daily units: 0-4 per product, seeded by day + product.
      const seed = (d.getTime() / 86400000 | 0) + Number(p.id.replace(/[^0-9]/g, '') || '0');
      const r = rng(seed)();
      const units = Math.floor(r * 5); // 0-4
      rev += units * p.price;
    }
    out.push({ date: iso, revenue: rev });
  }
  return out;
}

export function unitsSold(range: TimeRange): Map<string, number> {
  const days = rangeDays(range);
  const today = new Date();
  const m = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    for (const p of PRODUCTS) {
      const seed = (d.getTime() / 86400000 | 0) + Number(p.id.replace(/[^0-9]/g, '') || '0');
      const units = Math.floor(rng(seed)() * 5);
      m.set(p.id, (m.get(p.id) ?? 0) + units);
    }
  }
  return m;
}

export type KPIs = {
  totalRevenue: number;
  totalUnits: number;
  inventoryValue: number;
  avgRating: number;
  sustainablePct: number;
  lowStockCount: number;
  skuCount: number;
};

export function computeKPIs(range: TimeRange, categoryFilter?: string): KPIs {
  const series = revenueSeries(range, categoryFilter);
  const totalRevenue = series.reduce((s, x) => s + x.revenue, 0);
  const units = unitsSold(range);
  const items = categoryFilter ? PRODUCTS.filter((p) => p.category === categoryFilter) : PRODUCTS;
  const totalUnits = items.reduce((s, p) => s + (units.get(p.id) ?? 0), 0);
  const inventoryValue = items.reduce((s, p) => s + p.price * effectiveStock(p), 0);
  const avgRating = items.length ? items.reduce((s, p) => s + p.rating, 0) / items.length : 0;
  const sustainablePct = items.length
    ? Math.round((items.filter((p) => p.sustainable).length / items.length) * 100)
    : 0;
  const lowStockCount = items.filter((p) => effectiveStock(p) < 25).length;
  return {
    totalRevenue,
    totalUnits,
    inventoryValue,
    avgRating: Math.round(avgRating * 10) / 10,
    sustainablePct,
    lowStockCount,
    skuCount: items.length,
  };
}

export function revenueByCategory(range: TimeRange) {
  const units = unitsSold(range);
  const map = new Map<Product['category'], number>();
  for (const p of PRODUCTS) {
    const rev = (units.get(p.id) ?? 0) * p.price;
    map.set(p.category, (map.get(p.category) ?? 0) + rev);
  }
  return Array.from(map.entries())
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function topSellers(range: TimeRange, limit = 5) {
  const units = unitsSold(range);
  return [...PRODUCTS]
    .map((p) => ({ product: p, units: units.get(p.id) ?? 0, revenue: (units.get(p.id) ?? 0) * p.price }))
    .sort((a, b) => b.units - a.units)
    .slice(0, limit);
}

export function lowStockSkus() {
  return PRODUCTS.map((p) => ({ ...p, stock: effectiveStock(p) }))
    .filter((p) => p.stock < 25)
    .sort((a, b) => a.stock - b.stock);
}

export function catalogSummary(): string {
  const kpi = computeKPIs('30d');
  const top = topSellers('30d', 3).map((x) => `${x.product.name} (${x.units} units)`).join(', ');
  const low = lowStockSkus().slice(0, 3).map((p) => `${p.name} (${p.stock} left)`).join(', ');
  const cats = revenueByCategory('30d').slice(0, 3).map((c) => `${c.category} ₹${c.revenue}`).join(', ');
  return `30-day revenue: ₹${kpi.totalRevenue}. Units sold: ${kpi.totalUnits}. Inventory value: ₹${kpi.inventoryValue}. ` +
    `Top categories: ${cats}. Top sellers: ${top}. Low stock: ${low || 'none'}. ` +
    `Sustainable mix: ${kpi.sustainablePct}%. Avg rating: ${kpi.avgRating}.`;
}

export function resetStockDeltas() {
  stockDeltas.clear();
}
