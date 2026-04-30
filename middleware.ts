import { NextRequest, NextResponse } from 'next/server';
import { rateLimitConfig } from '@/lib/config';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

export function middleware(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1';

  const now = Date.now();
  const { windowMs, maxRequests } = rateLimitConfig;
  const record = store.get(ip);

  if (!record || now >= record.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return withRateLimitHeaders(NextResponse.next(), maxRequests, maxRequests - 1, now + windowMs);
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return new NextResponse(
      JSON.stringify({ error: 'Too Many Requests', retryAfter }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(record.resetAt / 1000)),
        },
      }
    );
  }

  record.count++;
  return withRateLimitHeaders(
    NextResponse.next(),
    maxRequests,
    maxRequests - record.count,
    record.resetAt
  );
}

function withRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  resetAt: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(limit));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
