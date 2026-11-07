const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

if (!redisUrl || !redisToken) {
  console.error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN.");
  process.exit(1);
}

let endpoint;
try {
  endpoint = new URL(redisUrl);
} catch {
  console.error("UPSTASH_REDIS_REST_URL is not a valid URL.");
  process.exit(1);
}

if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password) {
  console.error("The Upstash REST endpoint must use HTTPS and must not contain embedded credentials.");
  process.exit(1);
}

try {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redisToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["PING"]),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });

  const payload = await response.json();
  if (!response.ok || payload.result !== "PONG") {
    throw new Error(`Redis PING failed (HTTP ${response.status}).`);
  }

  console.log("Upstash Redis connection successful (PING: PONG). No credentials were printed.");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Could not connect to Upstash Redis.");
  process.exit(1);
}
