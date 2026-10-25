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
    const expectedHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || new URL(request.url).host;
    const expectedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || new URL(request.url).protocol.replace(":", "");
    return originUrl.host.toLowerCase() === expectedHost.toLowerCase() && originUrl.protocol.replace(":", "") === expectedProtocol;
  } catch { return false; }
}

export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}
