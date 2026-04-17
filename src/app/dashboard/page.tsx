'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils';
import {
  TrendingUp,
  Package,
  Leaf,
  AlertTriangle,
  Wallet,
  Sparkles,
  Download,
  RefreshCw,
  Loader2,
  Star,
} from 'lucide-react';

type Range = '7d' | '30d' | '90d';
const CATEGORIES = ['apparel', 'electronics', 'home', 'beauty', 'sports', 'books'] as const;
type Category = (typeof CATEGORIES)[number];

type Analytics = {
  range: Range;
  category: string | null;
  kpis: {
    totalRevenue: number;
    totalUnits: number;
    inventoryValue: number;
    avgRating: number;
    sustainablePct: number;
    lowStockCount: number;
    skuCount: number;
  };
  series: Array<{ date: string; revenue: number }>;
  byCategory: Array<{ category: string; revenue: number }>;
  topSellers: Array<{ id: string; name: string; units: number; revenue: number }>;
  lowStock: Array<{ id: string; name: string; stock: number; price: number; category: string }>;
};

export default function DashboardPage() {
  const [range, setRange] = useState<Range>('30d');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [restockBusyId, setRestockBusyId] = useState<string | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [insightsSource, setInsightsSource] = useState<'gemini' | 'fallback' | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ range });
      if (category !== 'all') qs.set('category', category);
      const resp = await fetch(`/api/retailer/analytics?${qs.toString()}`);
      const json = (await resp.json()) as Analytics;
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [range, category]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function restock(productId: string, delta: number) {
    setRestockBusyId(productId);
    try {
      await fetch('/api/retailer/restock', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId, delta }),
      });
      await fetchData();
    } finally {
      setRestockBusyId(null);
    }
  }

  async function runInsights() {
    setInsightsLoading(true);
    try {
      const resp = await fetch('/api/retailer/insights', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await resp.json();
      setInsights(Array.isArray(json.insights) ? json.insights : []);
      setInsightsSource(json.source === 'gemini' ? 'gemini' : 'fallback');
    } catch {
      setInsights([]);
    } finally {
      setInsightsLoading(false);
    }
  }

  function exportCSV() {
    if (!data) return;
    const rows = [
      ['Date', 'Revenue (₹)'],
      ...data.series.map((d) => [d.date, String(d.revenue)]),
      [],
      ['Product', 'Units', 'Revenue (₹)'],
      ...data.topSellers.map((s) => [s.name, String(s.units), String(s.revenue)]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopai-${range}-${category}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const maxCatRev = useMemo(
    () => (data ? Math.max(1, ...data.byCategory.map((c) => c.revenue)) : 1),
    [data]
  );

  return (
    <section className="container py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Retailer insights</h1>
          <p className="mt-1 text-muted-foreground">
            Live operational view — synthesized from the demo catalog, powered by Gemini for recommendations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex rounded-md border bg-background p-1"
            role="group"
            aria-label="Time range"
          >
            {(['7d', '30d', '90d'] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                aria-pressed={range === r}
                className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                  range === r ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} aria-label="Refresh data">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={!data}>
            <Download className="h-4 w-4" aria-hidden />
            Export CSV
          </Button>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Category filter">
        <span className="text-sm text-muted-foreground">Category:</span>
        <button
          onClick={() => setCategory('all')}
          aria-pressed={category === 'all'}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            category === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${
              category === c ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Revenue"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden />}
          value={data ? formatINR(data.kpis.totalRevenue) : '—'}
          hint={`${range.toUpperCase()} ${category === 'all' ? 'all categories' : category}`}
        />
        <KpiCard
          title="Units sold"
          icon={<Package className="h-4 w-4 text-muted-foreground" aria-hidden />}
          value={data ? String(data.kpis.totalUnits) : '—'}
          hint="Total orders"
        />
        <KpiCard
          title="Inventory value"
          icon={<Wallet className="h-4 w-4 text-muted-foreground" aria-hidden />}
          value={data ? formatINR(data.kpis.inventoryValue) : '—'}
          hint="At current stock"
        />
        <KpiCard
          title="Avg rating"
          icon={<Star className="h-4 w-4 text-amber-500" aria-hidden />}
          value={data ? `${data.kpis.avgRating.toFixed(1)} / 5` : '—'}
          hint={`${data?.kpis.skuCount ?? 0} SKUs`}
        />
        <KpiCard
          title="Sustainable"
          icon={<Leaf className="h-4 w-4 text-emerald-600" aria-hidden />}
          value={data ? `${data.kpis.sustainablePct}%` : '—'}
          hint="Eco-tagged SKUs"
        />
        <KpiCard
          title="Low stock"
          icon={<AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />}
          value={data ? String(data.kpis.lowStockCount) : '—'}
          hint="Below 25 units"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>Daily revenue over the selected window.</CardDescription>
          </CardHeader>
          <CardContent>
            {data ? <RevenueSparkline points={data.series} /> : <div className="h-40 animate-pulse rounded-md bg-muted" />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden />
                AI insights
              </CardTitle>
              <CardDescription>Gemini-powered merchandising ideas.</CardDescription>
            </div>
            <Button size="sm" onClick={runInsights} disabled={insightsLoading}>
              {insightsLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : 'Analyze'}
            </Button>
          </CardHeader>
          <CardContent>
            {insights.length === 0 && !insightsLoading && (
              <p className="text-sm text-muted-foreground">
                Click <strong>Analyze</strong> to get 3 tailored recommendations based on your live catalog.
              </p>
            )}
            {insights.length > 0 && (
              <>
                <ol className="space-y-2 text-sm">
                  {insights.map((t, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-3 text-xs text-muted-foreground">
                  Source: <Badge variant="secondary">{insightsSource ?? 'unknown'}</Badge>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by category</CardTitle>
            <CardDescription>Across all selected products.</CardDescription>
          </CardHeader>
          <CardContent>
            {data ? (
              <ul className="space-y-3" role="list">
                {data.byCategory.map((c) => (
                  <li key={c.category}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">{c.category}</span>
                      <span className="text-muted-foreground">{formatINR(c.revenue)}</span>
                    </div>
                    <div
                      className="h-2 w-full rounded-full bg-muted"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round((c.revenue / maxCatRev) * 100)}
                      aria-label={`${c.category} revenue share`}
                    >
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${(c.revenue / maxCatRev) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-40 animate-pulse rounded-md bg-muted" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top sellers</CardTitle>
            <CardDescription>Units sold in selected window.</CardDescription>
          </CardHeader>
          <CardContent>
            {data && data.topSellers.length > 0 ? (
              <ol className="space-y-2 text-sm">
                {data.topSellers.map((s, i) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-md border bg-background p-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="line-clamp-1 font-medium">{s.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{s.units} units</div>
                      <div className="text-xs text-muted-foreground">{formatINR(s.revenue)}</div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">No sales yet in this window.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Low-stock SKUs — restock now</CardTitle>
          <CardDescription>
            Inline restock updates the live stock count (in-memory demo — persists per server instance).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!data ? (
            <div className="h-24 animate-pulse rounded-md bg-muted" />
          ) : data.lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">No low-stock SKUs — inventory is healthy.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Low stock products with restock actions</caption>
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th scope="col" className="py-2 font-medium">Product</th>
                    <th scope="col" className="py-2 font-medium">Category</th>
                    <th scope="col" className="py-2 font-medium">Stock</th>
                    <th scope="col" className="py-2 font-medium">Price</th>
                    <th scope="col" className="py-2 font-medium">Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.lowStock.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 font-medium">{p.name}</td>
                      <td className="py-2 capitalize text-muted-foreground">{p.category}</td>
                      <td className="py-2">
                        <Badge variant={p.stock < 10 ? 'default' : 'secondary'}>{p.stock}</Badge>
                      </td>
                      <td className="py-2">{formatINR(p.price)}</td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restock(p.id, 10)}
                            disabled={restockBusyId === p.id}
                            aria-label={`Restock ${p.name} by 10`}
                          >
                            {restockBusyId === p.id ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : '+10'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restock(p.id, 50)}
                            disabled={restockBusyId === p.id}
                            aria-label={`Restock ${p.name} by 50`}
                          >
                            +50
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => restock(p.id, 100)}
                            disabled={restockBusyId === p.id}
                            aria-label={`Restock ${p.name} by 100`}
                          >
                            +100
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function KpiCard({ title, icon, value, hint }: { title: string; icon: React.ReactNode; value: string; hint: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription>{hint}</CardDescription>
      </CardContent>
    </Card>
  );
}

function RevenueSparkline({ points }: { points: Array<{ date: string; revenue: number }> }) {
  if (points.length === 0) return <div className="h-40" />;
  const w = 640;
  const h = 160;
  const pad = 12;
  const max = Math.max(1, ...points.map((p) => p.revenue));
  const step = (w - pad * 2) / Math.max(1, points.length - 1);
  const coords = points.map((p, i) => [pad + i * step, h - pad - (p.revenue / max) * (h - pad * 2)] as const);
  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`).join(' ');
  const area = `${path} L ${coords[coords.length - 1][0].toFixed(1)} ${h - pad} L ${coords[0][0].toFixed(1)} ${h - pad} Z`;
  const total = points.reduce((s, p) => s + p.revenue, 0);
  const peak = points.reduce((m, p) => (p.revenue > m.revenue ? p : m), points[0]);
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">
          Total: <span className="font-semibold text-foreground">{formatINR(total)}</span>
        </span>
        <span className="text-muted-foreground">
          Peak: <span className="font-semibold text-foreground">{formatINR(peak.revenue)}</span> on {peak.date}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-40 w-full"
        role="img"
        aria-label={`Revenue trend over ${points.length} days, total ${formatINR(total)}`}
      >
        <defs>
          <linearGradient id="spark-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#spark-grad)" className="text-primary" />
        <path d={path} fill="none" stroke="currentColor" strokeWidth={2} className="text-primary" />
        {coords.map((c, i) => (
          <circle key={i} cx={c[0]} cy={c[1]} r={1.5} className="fill-primary" />
        ))}
      </svg>
    </div>
  );
}
