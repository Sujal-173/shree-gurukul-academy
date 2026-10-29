import { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { isAdminRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { clientIp, isSameOrigin, jsonError, rateLimit } from "@/lib/security";
import { sanitizeContent } from "@/lib/sanitize-content";
import { contentSchema } from "@/lib/validators";
import { allowedContentScopes, mergeScopedContent } from "@/lib/content-scope";
import { validatePublishedCalendarRecords, validatePublishedCalendarResources, validatePublishedNoticeRecords } from "@/lib/published-content-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";



function validateContentBounds(value: unknown, depth = 0): string | null {
  if (depth > 16) return "Content nesting is too deep.";
  if (typeof value === "string") return value.length > 12_000 ? "A content field is too long (12,000 characters maximum)." : null;
  if (Array.isArray(value)) {
    if (value.length > 250) return "A content list contains too many items (250 maximum).";
    for (const item of value) { const issue = validateContentBounds(item, depth + 1); if (issue) return issue; }
    return null;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length > 250) return "An object contains too many properties.";
    for (const [key, child] of entries) {
      if (["__proto__", "prototype", "constructor"].includes(key)) return "A forbidden content key was found.";
      const issue = validateContentBounds(child, depth + 1); if (issue) return issue;
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) return jsonError("Authentication required.", 401);
  if (!isSameOrigin(request)) return jsonError("Invalid request origin.", 403);
  if (!rateLimit(`cms-save:${clientIp(request)}`, 40, 60 * 60 * 1000)) return jsonError("Too many content saves. Try again later.", 429);
  if (Number(request.headers.get("content-length") || 0) > 1_250_000) return jsonError("Content exceeds the 1.2 MB limit.", 413);
  const bodyText = await request.text();
  if (bodyText.length > 1_200_000) return jsonError("Content exceeds the 1.2 MB limit.", 413);
  let body: unknown;
  try { body = JSON.parse(bodyText); } catch { return jsonError("The content is not valid JSON.", 400); }
  if (!body || typeof body !== "object" || !("content" in body)) return jsonError("Missing content object.", 400);
  const scopeValue = (body as { scope?: unknown }).scope;
  const scope = typeof scopeValue === "string" ? scopeValue : undefined;
  if (scope && !allowedContentScopes.has(scope)) return jsonError("Unknown content editor scope.", 400);
  const parsed = contentSchema.safeParse((body as { content: unknown }).content);
  if (!parsed.success) return jsonError(`Invalid content structure: ${parsed.error.issues.slice(0, 3).map((item) => item.path.join(".")).join(", ")}`, 400);
  const boundIssue = validateContentBounds(parsed.data);
  if (boundIssue) return jsonError(boundIssue, 400);
  const calendarIssue = (!scope || scope === "calendar") ? validatePublishedCalendarRecords(parsed.data) : null;
  if (calendarIssue) return jsonError(calendarIssue, 400);
  const resourcesIssue = (!scope || scope === "calendar") ? validatePublishedCalendarResources(parsed.data) : null;
  if (resourcesIssue) return jsonError(resourcesIssue, 400);
  const noticeIssue = (!scope || scope === "home" || scope === "notices") ? validatePublishedNoticeRecords(parsed.data, scope === "home" || scope === "notices" ? scope : undefined) : null;
  if (noticeIssue) return jsonError(noticeIssue, 400);
  try {
    const db = await getDb();
    const currentContent = db.collection<{ _id: string; content: unknown; updatedAt?: Date | string; updatedBy?: string; version?: number }>("siteContent");
    const existing = await currentContent.findOne({ _id: "primary" });
    const savedAt = new Date();
    let scopedOrFullContent: unknown = parsed.data;
    if (scope) {
      try { scopedOrFullContent = mergeScopedContent(existing?.content, parsed.data, scope); }
      catch (error) { return jsonError(error instanceof Error ? error.message : "Could not merge the page draft.", 400); }
    }
    const cleanedContent = sanitizeContent(scopedOrFullContent);
    const nextVersion = Math.max(0, Number(existing?.version || 0)) + 1;

    // Preserve the last saved version before replacing it, so accidental edits can be reviewed and recovered.
    if (existing?.content && JSON.stringify(existing.content) !== JSON.stringify(cleanedContent)) {
      await db.collection("siteContentVersions").insertOne({
        content: existing.content,
        version: Math.max(1, Number(existing.version || 1)),
        sourceUpdatedAt: existing.updatedAt || savedAt,
        archivedAt: savedAt,
        archivedBy: process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin",
      });
      const obsolete = await db.collection("siteContentVersions").find({}, { projection: { _id: 1 } }).sort({ archivedAt: -1 }).skip(25).toArray();
      if (obsolete.length) await db.collection("siteContentVersions").deleteMany({ _id: { $in: obsolete.map((item) => item._id) } });
    }

    await currentContent.updateOne(
      { _id: "primary" },
      { $set: { content: cleanedContent, updatedAt: savedAt, updatedBy: process.env.ADMIN_EMAIL?.trim().toLowerCase(), version: nextVersion } },
      { upsert: true },
    );
    revalidateTag("site-content", { expire: 0 });
    revalidatePath("/", "layout");
    return Response.json({ ok: true, savedAt: savedAt.toISOString(), version: nextVersion, scope: scope || "all" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("CMS save failed:", error instanceof Error ? error.message : "Unknown error");
    return jsonError("Could not save content. Check the database connection and try again.", 503);
  }
}
