import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { rateLimit } from "../lib/security";

describe("distributed rate limiter configuration", () => {
  const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
  const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const originalRequired = process.env.UPSTASH_REDIS_REQUIRED;

  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.UPSTASH_REDIS_REQUIRED;
  });

  afterEach(() => {
    if (originalUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = originalUrl;
    if (originalToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
    if (originalRequired === undefined) delete process.env.UPSTASH_REDIS_REQUIRED;
    else process.env.UPSTASH_REDIS_REQUIRED = originalRequired;
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("fails closed when Redis is required but credentials are missing", async () => {
    process.env.UPSTASH_REDIS_REQUIRED = "true";
    await expect(rateLimit("test:missing-redis", 5, 60_000)).resolves.toBe(false);
  });


  it("requires Redis automatically in production even if the flag is false", async () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.UPSTASH_REDIS_REQUIRED = "false";
    await expect(rateLimit("test:production-requires-redis", 5, 60_000)).resolves.toBe(false);
  });

  it("fails closed when Redis is required but the REST request fails", async () => {
    process.env.UPSTASH_REDIS_REQUIRED = "true";
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network unavailable")));

    await expect(rateLimit("test:redis-down", 5, 60_000)).resolves.toBe(false);
  });

  it("uses the atomic Redis counter result when Redis is configured", async () => {
    process.env.UPSTASH_REDIS_REQUIRED = "true";
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 3 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(rateLimit("test:allowed", 5, 60_000)).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
    const requestInit = fetchMock.mock.calls[0][1] as RequestInit;
    expect(requestInit.headers).toMatchObject({ Authorization: "Bearer test-token" });
    expect(String(requestInit.body)).toContain("EVAL");
  });

  it("rejects the request after the Redis counter exceeds the route limit", async () => {
    process.env.UPSTASH_REDIS_REQUIRED = "true";
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 6 }),
    }));

    await expect(rateLimit("test:limited", 5, 60_000)).resolves.toBe(false);
  });
});
