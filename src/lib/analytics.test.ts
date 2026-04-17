import { describe, it, expect, beforeEach } from 'vitest';
import {
  revenueSeries,
  computeKPIs,
  topSellers,
  lowStockSkus,
  adjustStock,
  resetStockDeltas,
  catalogSummary,
} from './analytics';
import { PRODUCTS } from './products';

describe('analytics', () => {
  beforeEach(() => resetStockDeltas());

  it('revenueSeries returns the right number of days', () => {
    expect(revenueSeries('7d').length).toBe(7);
    expect(revenueSeries('30d').length).toBe(30);
    expect(revenueSeries('90d').length).toBe(90);
  });

  it('revenueSeries is deterministic across calls', () => {
    const a = revenueSeries('30d');
    const b = revenueSeries('30d');
    expect(a).toEqual(b);
  });

  it('computeKPIs returns non-negative values', () => {
    const k = computeKPIs('30d');
    expect(k.totalRevenue).toBeGreaterThanOrEqual(0);
    expect(k.inventoryValue).toBeGreaterThan(0);
    expect(k.skuCount).toBe(PRODUCTS.length);
  });

  it('topSellers returns sorted list', () => {
    const t = topSellers('30d', 5);
    expect(t.length).toBe(5);
    for (let i = 1; i < t.length; i++) {
      expect(t[i - 1].units).toBeGreaterThanOrEqual(t[i].units);
    }
  });

  it('adjustStock updates low-stock view', () => {
    const target = PRODUCTS.find((p) => p.stock < 25);
    if (!target) return;
    const before = lowStockSkus().find((p) => p.id === target.id)?.stock ?? 0;
    adjustStock(target.id, 100);
    const after = lowStockSkus().find((p) => p.id === target.id)?.stock;
    // After +100, it's no longer low-stock OR its stock is higher
    if (after !== undefined) expect(after).toBe(before + 100);
  });

  it('catalogSummary returns a non-empty summary string', () => {
    const s = catalogSummary();
    expect(s.length).toBeGreaterThan(50);
    expect(s).toMatch(/revenue/i);
  });
});
