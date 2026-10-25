import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { jsonError } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return "";
}

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) return jsonError("Authentication required.", 401);
  try {
    const db = await getDb();
    const collection = db.collection("siteContentVersions");
    const id = request.nextUrl.searchParams.get("id");
    if (id) {
      if (!ObjectId.isValid(id)) return jsonError("Invalid content revision identifier.", 400);
      const revision = await collection.findOne({ _id: new ObjectId(id) }, { projection: { content: 1, version: 1, sourceUpdatedAt: 1, archivedAt: 1, archivedBy: 1 } });
      if (!revision) return jsonError("That content revision no longer exists.", 404);
      return Response.json({ revision: { ...revision, _id: revision._id.toString(), sourceUpdatedAt: toIso(revision.sourceUpdatedAt), archivedAt: toIso(revision.archivedAt) } }, { headers: { "Cache-Control": "no-store" } });
    }
    const revisions = await collection.find({}, { projection: { version: 1, sourceUpdatedAt: 1, archivedAt: 1, archivedBy: 1 } }).sort({ archivedAt: -1 }).limit(25).toArray();
    return Response.json({ revisions: revisions.map((revision) => ({ ...revision, _id: revision._id.toString(), sourceUpdatedAt: toIso(revision.sourceUpdatedAt), archivedAt: toIso(revision.archivedAt) })) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Content history request failed:", error instanceof Error ? error.message : "Unknown error");
    return jsonError("Could not load content history. Check the database configuration.", 503);
  }
}
