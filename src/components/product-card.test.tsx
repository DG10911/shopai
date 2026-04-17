import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ProductCard } from './product-card';
import { PRODUCTS } from '@/lib/products';

describe('ProductCard', () => {
  it('renders product name and price', () => {
    render(<ProductCard product={PRODUCTS[0]} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(PRODUCTS[0].name);
    expect(screen.getByText(/₹/)).toBeInTheDocument();
  });

  it('labels the add-to-cart button for screen readers', () => {
    render(<ProductCard product={PRODUCTS[0]} />);
    expect(
      screen.getByRole('button', { name: new RegExp(`Add ${PRODUCTS[0].name} to cart`, 'i') })
    ).toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    const { container } = render(<ProductCard product={PRODUCTS[0]} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
