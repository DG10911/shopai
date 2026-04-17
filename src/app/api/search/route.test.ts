import { describe, it, expect } from 'vitest';
import { POST } from './route';

function makeReq(body: unknown) {
  return new Request('http://localhost/api/search', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': `test-${Math.random()}` },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof POST>[0];
}

describe('POST /api/search', () => {
  it('returns results for a text query', async () => {
    const resp = await POST(makeReq({ query: 'coffee' }));
    expect(resp.status).toBe(200);
    const data = await resp.json();
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.results.length).toBeGreaterThan(0);
  });

  it('returns 400 on malformed body', async () => {
    const resp = await POST(makeReq({ query: 123 }));
    expect(resp.status).toBe(400);
  });

  it('handles empty query without crashing', async () => {
    const resp = await POST(makeReq({ query: '' }));
    expect(resp.status).toBe(200);
    const data = await resp.json();
    expect(Array.isArray(data.results)).toBe(true);
  });
});
