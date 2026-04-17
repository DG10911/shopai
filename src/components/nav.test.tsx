import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Nav } from './nav';

describe('Nav', () => {
  it('renders primary navigation landmarks and links', () => {
    render(<Nav />);
    const navEl = screen.getByRole('navigation', { name: /primary/i });
    expect(navEl).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /shopai home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^shop$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ai concierge/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /retailer/i })).toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    const { container } = render(<Nav />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
