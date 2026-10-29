import { NextRequest } from "next/server";
import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from "cloudinary";
import { isAdminRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { clientIp, isSameOrigin, jsonError, rateLimit } from "@/lib/security";
import { isSupportedImageMime, isSupportedSchoolAttachmentMime, matchesSchoolAttachmentSignature, supportedDocumentMime } from "@/lib/upload-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_ATTACHMENT_BYTES = 12 * 1024 * 1024;

function configured() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return false;
  cloudinary.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET, secure: true });
  return true;
}

function safeOriginalName(value: string): string {
  return value.replace(/[\\/\r\n\0]/g, "_").trim().slice(0, 180) || "school-document";
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) return jsonError("Authentication required.", 401);
  if (!isSameOrigin(request)) return jsonError("Invalid request origin.", 403);
  if (!rateLimit(`admin-upload:${clientIp(request)}`, 30, 60 * 60 * 1000)) return jsonError("Upload limit reached. Try again later.", 429);
  if (Number(request.headers.get("content-length") || 0) > MAX_ATTACHMENT_BYTES + 1_000_000) return jsonError("File upload exceeds the 12 MB limit.", 413);
  if (!configured()) return jsonError("File storage is not configured. Add the Cloudinary credentials to the server environment.", 503);

  let form: FormData;
  try { form = await request.formData(); } catch { return jsonError("Invalid upload form.", 400); }
  const file = form.get("file");
  const purposeValue = form.get("purpose");
  if (purposeValue !== null && purposeValue !== "image" && purposeValue !== "attachment") return jsonError("Unknown upload purpose.", 400);
  const purpose = purposeValue === "attachment" ? "attachment" : "image";
  if (!(file instanceof File)) return jsonError("Choose a file to upload.", 400);
  const isImage = isSupportedImageMime(file.type);
  const isPdf = file.type === supportedDocumentMime;
  if (purpose === "image" && !isImage) return jsonError("Use a JPG, PNG, WebP or AVIF image.", 415);
  if (purpose === "attachment" && !isSupportedSchoolAttachmentMime(file.type)) return jsonError("School notices support JPG, PNG, WebP, AVIF images or PDF documents.", 415);
  const maxBytes = purpose === "attachment" ? MAX_ATTACHMENT_BYTES : MAX_IMAGE_BYTES;
  if (file.size <= 0 || file.size > maxBytes) return jsonError(`Files must be smaller than ${purpose === "attachment" ? "12" : "8"} MB.`, 413);

  const bytes = Buffer.from(await file.arrayBuffer());
  const validBytes = matchesSchoolAttachmentSignature(bytes, file.type);
  if (!validBytes) return jsonError("The file contents do not match the selected file type.", 415);

  const resourceType = isPdf ? "raw" : "image";
  try {
    const uploaded = await new Promise<UploadApiResponse>((resolve, reject) => {
      const options: UploadApiOptions = {
        folder: "gurukul-academy",
        resource_type: resourceType,
        filename: safeOriginalName(file.name),
        filename_override: safeOriginalName(file.name),
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      };
      if (isImage) options.transformation = [{ quality: "auto", fetch_format: "auto" }];
      const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error || !result) reject(error || new Error("Empty Cloudinary response"));
        else resolve(result);
      });
      stream.end(bytes);
    });
    const metadata = {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      resourceType,
      mimeType: file.type,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
      bytes: uploaded.bytes,
      originalName: safeOriginalName(file.name),
      createdAt: new Date(),
    };
    const db = await getDb();
    const inserted = await db.collection("media").insertOne(metadata);
    return Response.json({ ok: true, media: { ...metadata, _id: inserted.insertedId.toString(), createdAt: metadata.createdAt.toISOString() } }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("School asset upload failed:", error instanceof Error ? error.message : "Unknown upload error");
    return jsonError("Upload failed. Check Cloudinary and database configuration.", 502);
  }
}
