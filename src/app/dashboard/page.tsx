import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PRODUCTS, topCategories } from '@/lib/products';
import { formatINR } from '@/lib/utils';
import { TrendingUp, Package, Leaf, AlertTriangle } from 'lucide-react';

export const metadata = { title: 'Retailer Insights' };

export default function DashboardPage() {
  const cats = topCategories().sort((a, b) => b.revenue - a.revenue);
  const maxRev = Math.max(...cats.map((c) => c.revenue));
  const totalRevenue = cats.reduce((s, c) => s + c.revenue, 0);
  const totalSKUs = PRODUCTS.length;
  const sustainableCount = PRODUCTS.filter((p) => p.sustainable).length;
  const lowStock = PRODUCTS.filter((p) => p.stock < 25);

  return (
    <section className="container py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Retailer insights</h1>
          <p className="mt-1 text-muted-foreground">
            AI-assisted operational view — built for merchants, not customers.
          </p>
        </div>
        <Badge variant="secondary">Data synthesized from demo catalog</Badge>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Est. revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(totalRevenue)}</div>
            <CardDescription>Across all categories</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">SKUs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSKUs}</div>
            <CardDescription>Active product catalog</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sustainable mix</CardTitle>
            <Leaf className="h-4 w-4 text-emerald-600" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((sustainableCount / totalSKUs) * 100)}%
            </div>
            <CardDescription>{sustainableCount} of {totalSKUs} SKUs</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low stock alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStock.length}</div>
            <CardDescription>SKUs below 25 units</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by category</CardTitle>
            <CardDescription>Simple bar chart — swap for Looker Studio in production.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3" role="list">
              {cats.map((c) => (
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
                    aria-valuenow={Math.round((c.revenue / maxRev) * 100)}
                    aria-label={`${c.category} revenue share`}
                  >
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${(c.revenue / maxRev) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low-stock SKUs</CardTitle>
            <CardDescription>Restock recommendations.</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">No low-stock SKUs — all good.</p>
            ) : (
              <table className="w-full text-sm">
                <caption className="sr-only">Low stock products</caption>
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th scope="col" className="py-2 font-medium">Product</th>
                    <th scope="col" className="py-2 font-medium">Stock</th>
                    <th scope="col" className="py-2 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lowStock.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2">{p.name}</td>
                      <td className="py-2">
                        <Badge variant={p.stock < 10 ? 'default' : 'secondary'}>{p.stock}</Badge>
                      </td>
                      <td className="py-2">{formatINR(p.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
