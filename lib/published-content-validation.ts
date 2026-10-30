import { calendarCategoryKey, isRealCalendarDate } from "./calendar";
import { isSupportedSchoolAttachmentMime } from "./upload-validation";

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function validatePublishedCalendarRecords(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const root = value as Record<string, unknown>;
  const pages = root.pages;
  if (!pages || typeof pages !== "object" || Array.isArray(pages)) return null;
  const calendar = (pages as Record<string, unknown>).calendar;
  if (!calendar || typeof calendar !== "object" || Array.isArray(calendar)) return null;
  const records = (calendar as Record<string, unknown>).calendarEntries;
  if (!Array.isArray(records)) return "Calendar entries must be a list.";
  for (const item of records) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const record = item as Record<string, unknown>;
    if (record.active !== true) continue;
    const title = typeof record.title === "string" ? record.title.trim() : "";
    const description = typeof record.description === "string" ? record.description.trim() : "";
    const category = calendarCategoryKey(record.category);
    if (!title) return "Every published calendar record needs a title.";
    if (!category) return "Every published calendar record must be categorized as an event, holiday or examination.";
    const startDate = record.date;
    if (!isRealCalendarDate(startDate)) return `The published calendar record “${title}” needs a valid start date.`;
    if (!description) return `The published calendar record “${title}” needs details for families.`;
    const endDate = record.endDate;
    if (endDate !== undefined && endDate !== "" && !isRealCalendarDate(endDate)) return `The end date for “${title}” must be a valid date.`;
    if (typeof endDate === "string" && endDate && typeof startDate === "string" && endDate < startDate) return `The end date for “${title}” cannot be earlier than the start date.`;
    if (record.documentUrl && !isHttpUrl(record.documentUrl)) return `The supporting link for “${title}” must be a valid HTTP or HTTPS URL.`;
    if (record.documentType && !isSupportedSchoolAttachmentMime(String(record.documentType))) return `The attachment type for “${title}” is not supported. Use an approved image format or PDF.`;
  }
  return null;
}

export function validatePublishedCalendarResources(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const root = value as Record<string, unknown>;
  const pages = root.pages;
  if (!pages || typeof pages !== "object" || Array.isArray(pages)) return null;
  const calendar = (pages as Record<string, unknown>).calendar;
  if (!calendar || typeof calendar !== "object" || Array.isArray(calendar)) return null;
  const records = (calendar as Record<string, unknown>).calendarResources;
  if (records === undefined) return null;
  if (!Array.isArray(records)) return "School calendar files must be a list.";
  for (const item of records) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const record = item as Record<string, unknown>;
    if (record.active !== true) continue;
    const title = typeof record.title === "string" ? record.title.trim() : "";
    const description = typeof record.description === "string" ? record.description.trim() : "";
    const kind = record.kind;
    if (!title) return "Every published calendar file needs a title.";
    if (!description) return `Add a short description for “${title}” before publishing it.`;
    if (kind !== "school-calendar" && kind !== "exam-timetable") return `Choose a valid document type for “${title}”.`;
    if (kind === "exam-timetable" && !(typeof record.className === "string" && record.className.trim())) return `Choose the class or grade covered by “${title}” before publishing it.`;
    if (!isHttpUrl(record.documentUrl)) return `Attach a valid HTTP or HTTPS file URL to “${title}”.`;
    if (record.documentType !== undefined && record.documentType !== "" && !isSupportedSchoolAttachmentMime(String(record.documentType))) return `The attachment type for “${title}” is not supported. Use an approved image format or PDF.`;
  }
  return null;
}

export function validatePublishedNoticeRecords(value: unknown, scope?: "home" | "notices"): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const root = value as Record<string, unknown>;
  const home = root.home && typeof root.home === "object" && !Array.isArray(root.home) ? root.home as Record<string, unknown> : undefined;
  const pages = root.pages && typeof root.pages === "object" && !Array.isArray(root.pages) ? root.pages as Record<string, unknown> : undefined;
  const noticePage = pages?.notices && typeof pages.notices === "object" && !Array.isArray(pages.notices) ? pages.notices as Record<string, unknown> : undefined;
  const lists: Array<{ label: string; value: unknown }> = [
    ...(scope === "notices" ? [] : [{ label: "homepage", value: home?.notices }]),
    ...(scope === "home" ? [] : [{ label: "notice board", value: noticePage?.notices }]),
  ];
  for (const list of lists) {
    if (list.value === undefined) continue;
    if (!Array.isArray(list.value)) return `Published notices for the ${list.label} must be a list.`;
    for (const item of list.value) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const record = item as Record<string, unknown>;
      if (record.active !== true) continue;
      const title = typeof record.title === "string" ? record.title.trim() : "";
      const description = typeof record.description === "string" ? record.description.trim() : "";
      if (!title) return `Every published ${list.label} notice needs a title.`;
      if (!description) return `Add details to the published notice “${title}”.`;
      if (record.imageUrl !== undefined && record.imageUrl !== null && record.imageUrl !== "" && typeof record.imageUrl !== "string") return `The image for notice “${title}” must be a valid image URL.`;
      if (record.attachmentUrl && !isHttpUrl(record.attachmentUrl)) return `The attachment for notice “${title}” must use a valid HTTP or HTTPS URL.`;
      if (record.attachmentType && !isSupportedSchoolAttachmentMime(String(record.attachmentType))) return `The attachment for notice “${title}” must be an approved image format or PDF.`;
      if (record.imageUrl && typeof record.imageUrl === "string") {
        const image = record.imageUrl.trim();
        const localImage = image.startsWith("/") && !image.startsWith("//") && !image.startsWith("/\\") && !/\.svg(?:[?#].*)?$/i.test(image);
        let cloudinaryImage = false;
        try {
          const parsed = new URL(image);
          cloudinaryImage = parsed.protocol === "https:" && parsed.hostname === "res.cloudinary.com" && !/\.svg(?:[?#].*)?$/i.test(parsed.pathname);
        } catch { /* A permitted local path is checked above. */ }
        if (!localImage && !cloudinaryImage) return `The image for notice “${title}” must be a local site image or an HTTPS Cloudinary raster image.`;
      }
    }
  }
  return null;
}
