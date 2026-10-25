import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "gurukul_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;
const ISSUER = "shri-gurukul-academy";

function secretKey() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must be at least 32 characters.");
  return new TextEncoder().encode(value);
}

export function isAdminAuthConfigured(): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const secret = process.env.AUTH_SECRET;
  // A bcrypt hash is exactly 60 characters. A missing escaped "$" in .env.local
  // can silently corrupt the value during Next.js dotenv expansion.
  const validHash = typeof passwordHash === "string" && /^\$2[abxy]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(passwordHash);
  return Boolean(expectedEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(expectedEmail) && validHash && secret && secret.length >= 32);
}

export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!isAdminAuthConfigured() || !expectedEmail || !passwordHash) return false;
  if (email.trim().toLowerCase() !== expectedEmail) {
    // Still perform a hash check to reduce obvious response timing differences.
    try { await bcrypt.compare(password, passwordHash); } catch { /* Keep the result indistinguishable from an invalid password. */ }
    return false;
  }
  try { return await bcrypt.compare(password, passwordHash); } catch { return false; }
}

export async function createAdminToken(email: string) {
  return new SignJWT({ email: email.trim().toLowerCase(), role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .setIssuer(ISSUER)
    .sign(secretKey());
}

export async function verifyToken(token: string | undefined | null): Promise<{ email: string } | null> {
  if (!token || !process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: ISSUER, algorithms: ["HS256"] });
    const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (payload.role !== "admin" || typeof payload.email !== "string" || !expectedEmail || payload.email.toLowerCase() !== expectedEmail) return null;
    return { email: payload.email };
  } catch { return null; }
}

export async function isAdminRequest(request: NextRequest): Promise<boolean> {
  return Boolean(await verifyToken(request.cookies.get(ADMIN_COOKIE)?.value));
}

export async function getAdminSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  return verifyToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

export const sessionAgeSeconds = SESSION_SECONDS;
