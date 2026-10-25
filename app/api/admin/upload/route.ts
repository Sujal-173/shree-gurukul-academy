import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { isAdminRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { clientIp, isSameOrigin, jsonError, rateLimit } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BYTES = 8 * 1024 * 1024;
const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function configured() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return false;
  cloudinary.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET, secure: true });
  return true;
}

function matchesImageSignature(bytes: Buffer, mime: string): boolean {
  if (mime === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "image/png") return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mime === "image/webp") return bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  if (mime === "image/avif") return bytes.length >= 12 && bytes.toString("ascii", 4, 8) === "ftyp" && ["avif", "avis", "mif1"].includes(bytes.toString("ascii", 8, 12));
  return false;
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) return jsonError("Authentication required.", 401);
  if (!isSameOrigin(request)) return jsonError("Invalid request origin.", 403);
  if (!rateLimit(`admin-upload:${clientIp(request)}`, 30, 60 * 60 * 1000)) return jsonError("Upload limit reached. Try again later.", 429);
  if (Number(request.headers.get("content-length") || 0) > MAX_BYTES + 1_000_000) return jsonError("Image upload exceeds the 8 MB limit.", 413);
  if (!configured()) return jsonError("Image storage is not configured. Add the Cloudinary credentials to the server environment.", 503);
  let form: FormData;
  try { form = await request.formData(); } catch { return jsonError("Invalid upload form.", 400); }
  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("Choose an image to upload.", 400);
  if (!allowed.has(file.type)) return jsonError("Use a JPG, PNG, WebP or AVIF image.", 415);
  if (file.size <= 0 || file.size > MAX_BYTES) return jsonError("Images must be smaller than 8 MB.", 413);
  const arrayBuffer = await file.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);
  if (!matchesImageSignature(bytes, file.type)) return jsonError("The file contents do not match the selected image format.", 415);
  try {
    const uploaded = await new Promise<{ secure_url: string; public_id: string; width: number; height: number; format: string; bytes: number }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({
        folder: "gurukul-academy",
        resource_type: "image",
        unique_filename: true,
        overwrite: false,
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      }, (error, result) => {
        if (error || !result) reject(error || new Error("Empty Cloudinary response"));
        else resolve(result);
      });
      stream.end(bytes);
    });
    const metadata = {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
      bytes: uploaded.bytes,
      originalName: file.name.slice(0, 200),
      createdAt: new Date(),
    };
    const db = await getDb();
    await db.collection("media").insertOne(metadata);
    return Response.json({ ok: true, media: { ...metadata, createdAt: metadata.createdAt.toISOString() } }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Image upload failed:", error instanceof Error ? error.message : "Unknown upload error");
    return jsonError("Upload failed. Check Cloudinary and database configuration.", 502);
  }
}
