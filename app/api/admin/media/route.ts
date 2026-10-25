import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import { isAdminRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { clientIp, isSameOrigin, jsonError, rateLimit } from "@/lib/security";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) return jsonError("Authentication required.", 401);
  try {
    const db = await getDb();
    const media = await db.collection("media").find({}, { projection: { _id: 1, url: 1, publicId: 1, width: 1, height: 1, format: 1, bytes: 1, originalName: 1, createdAt: 1 } }).sort({ createdAt: -1 }).limit(100).toArray();
    return Response.json({ media: media.map((item) => ({ ...item, _id: item._id.toString(), createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt })) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Media list failed:", error instanceof Error ? error.message : "Unknown error");
    return jsonError("Could not load uploaded media. Check the database configuration.", 503);
  }
}

function containsReference(value: unknown, url: string, publicId: string): boolean {
  if (typeof value === "string") return Boolean((url && value === url) || (publicId && value.includes(publicId)));
  if (Array.isArray(value)) return value.some((item) => containsReference(item, url, publicId));
  if (value && typeof value === "object") return Object.values(value as Record<string, unknown>).some((item) => containsReference(item, url, publicId));
  return false;
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminRequest(request))) return jsonError("Authentication required.", 401);
  if (!isSameOrigin(request)) return jsonError("Invalid request origin.", 403);
  if (!rateLimit(`admin-media-delete:${clientIp(request)}`, 20, 60 * 60 * 1000)) return jsonError("Too many media deletion requests. Try again later.", 429);
  let body: unknown;
  try { body = await request.json(); } catch { return jsonError("Invalid request body.", 400); }
  const id = body && typeof body === "object" ? (body as { id?: unknown }).id : undefined;
  if (typeof id !== "string" || !ObjectId.isValid(id)) return jsonError("Invalid media identifier.", 400);
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return jsonError("Cloudinary is not configured, so media cannot be safely removed.", 503);
  cloudinary.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET, secure: true });
  try {
    const db = await getDb();
    const media = await db.collection("media").findOne({ _id: new ObjectId(id) });
    if (!media) return jsonError("Media item not found.", 404);
    const content = await db.collection<{ _id: string; content: unknown }>("siteContent").findOne({ _id: "primary" }, { projection: { content: 1 } });
    const revisions = await db.collection("siteContentVersions").find({}, { projection: { content: 1 } }).toArray();
    const imageUrl = typeof media.url === "string" ? media.url : "";
    const publicId = typeof media.publicId === "string" ? media.publicId : "";
    if (!publicId) return jsonError("The media record has no Cloudinary public ID and cannot be safely removed.", 409);
    const referenced = containsReference(content?.content, imageUrl, publicId) || revisions.some((revision) => containsReference(revision.content, imageUrl, publicId));
    if (referenced) {
      return jsonError("This image is referenced by saved content or a recent revision. Replace those references and wait until the revision ages out before deleting it.", 409);
    }
    const removed = await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
    if (removed.result !== "ok" && removed.result !== "not found") return jsonError("Cloudinary did not confirm deletion. The media record was kept.", 502);
    await db.collection("media").deleteOne({ _id: new ObjectId(id) });
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Media deletion failed:", error instanceof Error ? error.message : "Unknown media error");
    return jsonError("Could not delete this media item.", 503);
  }
}
