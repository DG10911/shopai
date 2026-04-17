import { describe, it, expect } from 'vitest';
import { cn, formatINR, slugify } from './utils';

describe('utils', () => {
  it('merges class names', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });
  it('formats INR with ₹', () => {
    const s = formatINR(12999);
    expect(s).toMatch(/₹/);
    expect(s).toMatch(/12,999/);
  });
  it('slugifies', () => {
    expect(slugify('Hello World! 42')).toBe('hello-world-42');
  });
});
