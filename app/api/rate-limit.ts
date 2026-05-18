/**
 * In-memory rate limiter for Next.js API routes.
 * 
 * Uses a sliding window approach per IP address.
 * Stores data in-memory (resets on cold start — acceptable for this use case).
 * 
 * For production multi-instance deployments, replace with Redis (e.g. Upstash).
 */

interface RateLimitRecord {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitRecord>();

/**
 * Returns { success: true } if the request is within limits,
 * or { success: false, retryAfter: number } if rate-limited.
 * 
 * @param identifier - Typically the client IP address.
 * @param limit      - Max requests per window.
 * @param windowMs   - Time window in milliseconds.
 */
export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; retryAfter?: number; remaining?: number } {
  const now = Date.now();
  const record = store.get(identifier);

  // If no record or window has expired, start fresh
  if (!record || now - record.windowStart > windowMs) {
    store.set(identifier, { count: 1, windowStart: now });
    return { success: true, remaining: limit - 1 };
  }

  // Within the current window
  if (record.count < limit) {
    record.count++;
    return { success: true, remaining: limit - record.count };
  }

  // Rate limited
  const retryAfter = Math.ceil((record.windowStart + windowMs - now) / 1000);
  return { success: false, retryAfter };
}

/**
 * Extract a best-effort IP address from a Next.js request.
 * Handles reverse proxies (Vercel, Cloudflare, etc.)
 */
export function getClientIP(request: Request): string {
  const headers = request.headers;
  return (
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('cf-connecting-ip') ||
    'unknown'
  );
}
