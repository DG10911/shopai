import { describe, it, expect } from 'vitest';
import { rateLimit } from './rate-limit';

describe('rateLimit', () => {
  it('allows under the limit and blocks over it', () => {
    const ip = `test-${Math.random()}`;
    const max = Number(process.env.RATE_LIMIT_RPM ?? 60);
    for (let i = 0; i < max; i++) {
      expect(rateLimit(ip).ok).toBe(true);
    }
    expect(rateLimit(ip).ok).toBe(false);
  });

  it('returns remaining count that decreases', () => {
    const ip = `test-${Math.random()}`;
    const a = rateLimit(ip);
    const b = rateLimit(ip);
    expect(b.remaining).toBeLessThan(a.remaining);
  });
});
