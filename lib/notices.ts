import type { NoticeItem } from "./types";

function safeNoticeImage(value: unknown): string {
  if (typeof value !== "string") return "";
  const candidate = value.trim();
  if (!candidate || candidate.startsWith("//") || candidate.startsWith("/\\") || /\.svg(?:[?#].*)?$/i.test(candidate)) return "";
  if (candidate.startsWith("/")) return candidate;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com" && !/\.svg(?:[?#].*)?$/i.test(url.pathname) ? candidate : "";
  } catch {
    return "";
  }
}

function safeNoticeAttachment(value: unknown): string {
  if (typeof value !== "string") return "";
  const candidate = value.trim();
  if (!candidate || candidate.startsWith("//") || candidate.startsWith("/\\") || /\.svg(?:[?#].*)?$/i.test(candidate)) return "";
  if (candidate.startsWith("/")) return candidate;
  try {
    const url = new URL(candidate);
    return ["https:", "http:"].includes(url.protocol) ? candidate : "";
  } catch {
    return "";
  }
}

/** Normalize legacy CMS records so malformed list items cannot crash public pages. */
function normalizePublishedNotice(value: unknown): NoticeItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const description = typeof record.description === "string" ? record.description.trim() : "";
  if (record.active !== true || !title || !description) return null;
  const category = typeof record.category === "string" && record.category.trim() ? record.category.trim() : "School notice";
  const date = typeof record.date === "string" ? record.date.trim() : "";
  const id = typeof record.id === "string" && record.id.trim()
    ? record.id.trim()
    : `notice-${title.toLocaleLowerCase("en-IN")}-${date.toLocaleLowerCase("en-IN")}`;
  const imageUrl = safeNoticeImage(record.imageUrl);
  const attachmentUrl = safeNoticeAttachment(record.attachmentUrl);
  const imageAlt = typeof record.imageAlt === "string" ? record.imageAlt.trim() : "";
  const attachmentName = typeof record.attachmentName === "string" ? record.attachmentName.trim() : "";
  const attachmentType = typeof record.attachmentType === "string" ? record.attachmentType.trim() : "";
  return {
    id,
    category,
    title,
    date,
    description,
    active: true,
    ...(imageUrl ? { imageUrl } : {}),
    ...(imageAlt ? { imageAlt } : {}),
    ...(attachmentUrl ? { attachmentUrl } : {}),
    ...(attachmentName ? { attachmentName } : {}),
    ...(attachmentType ? { attachmentType } : {}),
  };
}

/**
 * Combine Notice Board and homepage notices for the public notice list.
 * A notice may intentionally appear in both editors; deduplicate by ID and also
 * by normalized title/date so older records without shared IDs are not repeated.
 * Page-specific notices come first, preserving their fuller copy over a home teaser.
 */
export function combinePublishedNotices(
  pageNotices: readonly unknown[],
  homeNotices: readonly unknown[],
): NoticeItem[] {
  const seenIds = new Set<string>();
  const seenFingerprints = new Set<string>();
  const result: NoticeItem[] = [];

  for (const candidate of [...pageNotices, ...homeNotices]) {
    const notice = normalizePublishedNotice(candidate);
    if (!notice) continue;

    const id = notice.id.trim();
    const fingerprint = `${notice.title.toLocaleLowerCase("en-IN")}\u0000${notice.date.toLocaleLowerCase("en-IN")}`;
    if ((id && seenIds.has(id)) || seenFingerprints.has(fingerprint)) continue;

    if (id) seenIds.add(id);
    seenFingerprints.add(fingerprint);
    result.push(notice);
  }

  return result;
}
