import { createHash } from "node:crypto";
import { isIP } from "node:net";
import type { NextRequest } from "next/server";

type Bucket = { hits: number; resetAt: number };
const globalBuckets = globalThis as typeof globalThis & { __gurukulRateBuckets?: Map<string, Bucket> };
const buckets = globalBuckets.__gurukulRateBuckets ??= new Map<string, Bucket>();

export function clientIp(request: NextRequest): string {
  // Configure the hosting proxy to overwrite/sanitize these headers. Never use an IP for authorization.
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
  if (isIP(forwarded)) return forwarded;
  const realIp = request.headers.get("x-real-ip")?.trim() || "";
  return isIP(realIp) ? realIp : "unknown";
}

function memoryRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { hits: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) {
      for (const [entry, value] of buckets) {
        if (value.resetAt <= now) buckets.delete(entry);
      }
    }
    // Bound memory use if an attacker rotates source IPs faster than entries expire.
    if (buckets.size >= 10_000) {
      const oldestKeys = buckets.keys();
      for (let index = 0; index < 1_000; index += 1) {
        const next = oldestKeys.next();
        if (next.done) break;
        buckets.delete(next.value);
      }
    }
    return true;
  }
  if (current.hits >= limit) return false;
  current.hits += 1;
  return true;
}

/**
 * Uses Upstash Redis when configured so limits are shared across serverless or
 * multi-instance deployments. The in-process fallback is development-only and
 * is not a distributed security boundary. Production always fails closed.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/+$/, "");
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  const redisRequired = process.env.NODE_ENV === "production" || process.env.UPSTASH_REDIS_REQUIRED === "true";

  // Production always requires Redis. The explicit flag also enables fail-closed
  // behavior in staging/preview environments before they are promoted.
  if (!redisUrl || !redisToken) {
    if (redisRequired) {
      console.error("Distributed rate limiter is required but Upstash credentials are missing.");
      return false;
    }
    return memoryRateLimit(key, limit, windowMs);
  }

  try {
    const parsedUrl = new URL(redisUrl);
    if (parsedUrl.protocol !== "https:" || parsedUrl.username || parsedUrl.password) {
      throw new Error("Upstash REST URL must be an HTTPS URL without embedded credentials.");
    }
    const hashedKey = createHash("sha256").update(key).digest("hex");
    const script = "local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('PEXPIRE', KEYS[1], tonumber(ARGV[1])); end; return count";
    const response = await fetch(parsedUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${redisToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(["EVAL", script, "1", `gurukul:rate:${hashedKey}`, String(windowMs)]),
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) throw new Error(`Upstash rate-limit request returned HTTP ${response.status}.`);
    const payload = await response.json() as { result?: unknown; error?: string };
    if (typeof payload.result !== "number") throw new Error(payload.error || "Upstash returned an invalid rate-limit result.");
    return payload.result <= limit;
  } catch (error) {
    console.error("Distributed rate limiter unavailable:", error instanceof Error ? error.message : "Unknown Redis error");
    // Fail closed in production when Redis is marked as required. The local
    // fallback is deliberately limited to development/non-required setups.
    if (redisRequired) return false;
    return memoryRateLimit(key, limit, windowMs);
  }
}

/** Reads a request body with a hard byte ceiling, including chunked/unknown-length requests. */
export async function readBodyLimited(request: Request, maxBytes: number): Promise<Uint8Array | null> {
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    try { await reader.cancel(); } catch { /* request stream already closed */ }
    throw new Error("Could not read request body.");
  }
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

export async function readTextBodyLimited(request: Request, maxBytes: number): Promise<string | null> {
  const bytes = await readBodyLimited(request, maxBytes);
  return bytes === null ? null : new TextDecoder().decode(bytes);
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
