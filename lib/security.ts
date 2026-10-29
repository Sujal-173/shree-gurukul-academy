import type { NextRequest } from "next/server";

type Bucket = { hits: number; resetAt: number };
const globalBuckets = globalThis as typeof globalThis & { __gurukulRateBuckets?: Map<string, Bucket> };
const buckets = globalBuckets.__gurukulRateBuckets ??= new Map<string, Bucket>();

export function clientIp(request: NextRequest): string {
  // Prefer the platform's trusted forwarded header configuration. Never use this value for authorization.
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { hits: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) for (const [entry, value] of buckets) if (value.resetAt <= now) buckets.delete(entry);
    return true;
  }
  if (current.hits >= limit) return false;
  current.hits += 1;
  return true;
}

export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const originUrl = new URL(origin);
    // Prefer the configured canonical origin. Do not trust caller-controlled
    // X-Forwarded-Host / X-Forwarded-Proto headers for CSRF validation.
    const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    const expectedOrigin = configuredOrigin
      ? new URL(configuredOrigin).origin
      : new URL(request.url).origin;
    return originUrl.origin.toLowerCase() === expectedOrigin.toLowerCase();
  } catch {
    return false;
  }
}

export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}
