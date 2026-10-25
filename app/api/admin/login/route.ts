import { NextRequest, NextResponse } from "next/server";
import { createAdminToken, sessionAgeSeconds, verifyCredentials, isAdminAuthConfigured, ADMIN_COOKIE } from "@/lib/auth";
import { clientIp, isSameOrigin, jsonError, rateLimit } from "@/lib/security";
import { loginSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("Invalid request origin.", 403);
  if (Number(request.headers.get("content-length") || 0) > 12_000) return jsonError("Request body is too large.", 413);
  if (!rateLimit(`admin-login:${clientIp(request)}`, 8, 15 * 60 * 1000)) return jsonError("Too many login attempts. Try again in 15 minutes.", 429);
  let input: unknown;
  try { input = await request.json(); } catch { return jsonError("Invalid request body.", 400); }
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return jsonError("Enter a valid email and password.", 400);
  if (!isAdminAuthConfigured()) {
    return jsonError("Admin login configuration is invalid. Check ADMIN_EMAIL, a valid 60-character bcrypt ADMIN_PASSWORD_HASH, and AUTH_SECRET (32+ characters). In local .env files, escape every dollar sign in the bcrypt hash as \"\\$\".", 503);
  }
  if (!(await verifyCredentials(parsed.data.email, parsed.data.password))) return jsonError("The email or password is incorrect.", 401);
  const token = await createAdminToken(parsed.data.email);
  const response = NextResponse.json({ ok: true, redirect: "/admin" }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: sessionAgeSeconds,
  });
  return response;
}
