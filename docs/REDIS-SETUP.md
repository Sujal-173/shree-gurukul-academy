# Upstash Redis setup for production rate limiting

This project uses the Upstash Redis **REST API** directly through server-side `fetch`. No Redis npm package or TCP connection is required. The REST interface is suitable for Next.js serverless deployments.

## 1. Create a Redis database

1. Create/sign in to an account at https://console.upstash.com/.
2. Select **Redis** and create a database.
3. Choose a region close to the deployed Next.js server/function region (not simply the visitor's location). If the app is hosted in an India region, choose the closest available India region.
4. Keep the database private. Do not enable public read access for this application.
5. Open the database's **REST API** / connection details.
6. Copy the HTTPS REST URL and the standard read/write REST token.

The standard token is required because the rate limiter executes `EVAL`, `INCR`, and `PEXPIRE`. A read-only token will not work. Never put the standard token in a `NEXT_PUBLIC_` variable, browser code, Git, screenshots, or client-side settings.

## 2. Configure local development

Create `.env.local` in the project root (it is gitignored) and add:

```env
UPSTASH_REDIS_REST_URL=https://YOUR-DATABASE.upstash.io
UPSTASH_REDIS_REST_TOKEN=YOUR_STANDARD_REST_TOKEN
UPSTASH_REDIS_REQUIRED=false
```

Use the exact endpoint and token shown in your Upstash console. Do not include quotation marks unless the value itself requires them.

Install dependencies and test the connection:

```bash
npm ci
npm run check:redis
```

Expected output:

```text
Upstash Redis connection successful (PING: PONG). No credentials were printed.
```

Restart the Next.js development server after changing environment variables.

## 3. Configure production hosting

Add these three environment variables in the hosting provider's server-side project settings for **Production** (and Preview if previews need protected API testing):

```env
UPSTASH_REDIS_REST_URL=https://YOUR-DATABASE.upstash.io
UPSTASH_REDIS_REST_TOKEN=YOUR_STANDARD_REST_TOKEN
UPSTASH_REDIS_REQUIRED=true
```

Do not prefix Redis variables with `NEXT_PUBLIC_`. Redeploy after setting them. Production automatically requires Redis because `NODE_ENV=production`; `UPSTASH_REDIS_REQUIRED=true` also enables fail-closed behavior in Preview/staging. If credentials are missing or Redis is unavailable, rate-limited API requests are denied rather than silently falling back to per-instance memory counters. This is a fail-closed security choice and means login, upload, CMS, enquiry and other protected/rate-limited endpoints can return HTTP 429 while Redis is unavailable. Monitor Upstash availability and alert on these errors. Setting the flag to `false` does not disable the production requirement.

## 4. Verify after deployment

1. Run `npm run check:redis` locally with production credentials only if your security policy permits; otherwise verify in the hosting environment using a one-off server-side check.
2. Confirm the hosting environment has all three variables and redeployed successfully.
3. Attempt several requests to a rate-limited endpoint. Confirm normal requests work under the configured limit and excess requests return HTTP 429.
4. Inspect server logs for `Distributed rate limiter unavailable`. Do not log or expose the token.
5. Test a controlled Redis outage in staging. With `UPSTASH_REDIS_REQUIRED=true`, the rate-limited endpoint should fail closed; restore Redis immediately afterward.

## 5. What the application rate-limits

Current limits are defined at the route call sites, not in the Redis console:

| Endpoint/action | Limit | Window |
|---|---:|---:|
| Admin login | 8 | 15 minutes |
| Public enquiries | 5 | 10 minutes |
| Admin uploads | 30 | 1 hour |
| CMS saves | 40 | 1 hour |
| Admin inquiry updates | 60 | 1 hour |
| Admin media deletes | 20 | 1 hour |

Each key is hashed before it is stored in Redis. Redis keys expire automatically after the configured window. Limits are shared across application instances that use the same Redis database.

## 6. Troubleshooting

- **HTTP 401/403 from Redis:** confirm you copied the standard read/write REST token, not the read-only token; rotate the token if it was exposed.
- **Invalid URL:** copy the HTTPS REST URL, not the Redis TCP connection string.
- **Timeout:** check hosting egress/network policy and select a region near the deployed app.
- **All protected routes return 429:** with `UPSTASH_REDIS_REQUIRED=true`, this usually means credentials are missing or Redis requests are failing. Check server logs and hosting environment settings.
- **Local development without Redis:** use `UPSTASH_REDIS_REQUIRED=false` while `NODE_ENV=development`; the project will use a process-local fallback. That fallback is not a production distributed security boundary.

## References

- https://upstash.com/docs/redis/features/restapi
- https://upstash.com/docs/redis/howto/connect-with-upstash-redis
- https://upstash.com/pricing/redis
