import { NextRequest } from 'next/server';
import {
  computeKPIs,
  revenueSeries,
  revenueByCategory,
  topSellers,
  lowStockSkus,
  type TimeRange,
} from '@/lib/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseRange(v: string | null): TimeRange {
  return v === '7d' || v === '30d' || v === '90d' ? v : '30d';
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get('range'));
  const categoryParam = url.searchParams.get('category');
  const category =
    categoryParam && ['apparel', 'electronics', 'home', 'beauty', 'sports', 'books'].includes(categoryParam)
      ? categoryParam
      : undefined;

  const kpis = computeKPIs(range, category);
  const series = revenueSeries(range, category);
  const byCategory = revenueByCategory(range);
  const sellers = topSellers(range, 5);
  const lowStock = lowStockSkus();

  return Response.json({
    range,
    category: category ?? null,
    kpis,
    series,
    byCategory,
    topSellers: sellers.map((s) => ({ id: s.product.id, name: s.product.name, units: s.units, revenue: s.revenue })),
    lowStock: lowStock.map((p) => ({ id: p.id, name: p.name, stock: p.stock, price: p.price, category: p.category })),
  });
}
