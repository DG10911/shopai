// Simple in-memory token-bucket rate limiter keyed by IP.
// For production use a Redis/Firestore-backed limiter — this keeps the demo
// self-contained and still prevents abusive bursts.

const WINDOW_MS = 60_000;
const MAX = Number(process.env.RATE_LIMIT_RPM ?? 60);

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(ip: string): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    const fresh: Bucket = { count: 1, resetAt: now + WINDOW_MS };
    buckets.set(ip, fresh);
    return { ok: true, remaining: MAX - 1, resetAt: fresh.resetAt };
  }
  b.count += 1;
  if (b.count > MAX) return { ok: false, remaining: 0, resetAt: b.resetAt };
  return { ok: true, remaining: MAX - b.count, resetAt: b.resetAt };
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'anonymous';
}
