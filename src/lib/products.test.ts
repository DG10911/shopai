import { describe, it, expect } from 'vitest';
import { searchProducts, getProduct, topCategories, PRODUCTS } from './products';

describe('products', () => {
  it('returns all products for an empty query', () => {
    expect(searchProducts('').length).toBe(PRODUCTS.length);
  });

  it('filters by tag match', () => {
    const r = searchProducts('coffee');
    expect(r.length).toBeGreaterThan(0);
    for (const p of r) {
      const hay = `${p.name} ${p.description} ${p.tags.join(' ')}`.toLowerCase();
      expect(hay).toContain('coffee');
    }
  });

  it('filters by category', () => {
    const r = searchProducts('', { category: 'books' });
    for (const p of r) expect(p.category).toBe('books');
  });

  it('respects maxPrice', () => {
    const cap = 1000;
    const r = searchProducts('', { maxPrice: cap });
    for (const p of r) expect(p.price).toBeLessThanOrEqual(cap);
  });

  it('returns only sustainable when requested', () => {
    const r = searchProducts('', { sustainable: true });
    expect(r.length).toBeGreaterThan(0);
    for (const p of r) expect(p.sustainable).toBe(true);
  });

  it('looks up by id', () => {
    expect(getProduct('p-001')?.name).toMatch(/AeroKnit/);
    expect(getProduct('missing')).toBeUndefined();
  });

  it('aggregates categories with positive revenue', () => {
    const cats = topCategories();
    expect(cats.length).toBeGreaterThanOrEqual(3);
    for (const c of cats) expect(c.revenue).toBeGreaterThan(0);
  });

  it('ranks laptops first when searching "laptop"', () => {
    const r = searchProducts('laptop');
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].tags).toContain('laptop');
  });

  it('returns gardening items for a birthday gift query', () => {
    const r = searchProducts('Birthday gift for my mom who loves gardening, under ₹2000');
    expect(r.length).toBeGreaterThan(0);
    const joined = r.slice(0, 3).map((p) => p.tags.join(' ')).join(' ');
    expect(joined).toMatch(/garden|plant|bonsai/);
  });

  it('ignores pure stop-word queries and still returns something', () => {
    const r = searchProducts('the a with for');
    expect(r.length).toBeGreaterThan(0);
  });
});
