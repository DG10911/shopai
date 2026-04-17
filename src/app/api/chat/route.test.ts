import { describe, it, expect } from 'vitest';
import { POST } from './route';

function makeReq(body: unknown) {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': `test-${Math.random()}` },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof POST>[0];
}

describe('POST /api/chat', () => {
  it('returns 400 on invalid schema', async () => {
    const resp = await POST(makeReq({ messages: 'not an array' }));
    expect(resp.status).toBe(400);
  });

  it('returns 400 when messages is empty', async () => {
    const resp = await POST(makeReq({ messages: [] }));
    expect(resp.status).toBe(400);
  });

  it('runs the offline fallback when no Gemini key is configured', async () => {
    // In test env GEMINI_API_KEY is unset — route must still return useful data.
    const resp = await POST(
      makeReq({ messages: [{ role: 'user', content: 'coffee' }] })
    );
    expect(resp.status).toBe(200);
    const data = await resp.json();
    expect(typeof data.text).toBe('string');
    expect(Array.isArray(data.products)).toBe(true);
  });

  it('rejects payload with oversized message', async () => {
    const resp = await POST(
      makeReq({ messages: [{ role: 'user', content: 'a'.repeat(5000) }] })
    );
    expect(resp.status).toBe(400);
  });
});
