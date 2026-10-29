import type { CalendarEntry, CalendarResource } from "./types";
import { isSupportedSchoolAttachmentMime } from "./upload-validation";

export type CalendarCategoryKey = "events" | "holidays" | "exams";

export const calendarCategories: Record<CalendarCategoryKey, {
  label: string;
  description: string;
  aliases: string[];
}> = {
  events: {
    label: "Events & Celebrations",
    description: "School events, celebrations and activity schedules published by the academy.",
    aliases: ["event", "events", "celebration", "celebrations", "activity", "activities", "contest", "contests", "competition", "competitions"],
  },
  holidays: {
    label: "Holidays",
    description: "Official school holidays and vacation schedules confirmed by the school office.",
    aliases: ["holiday", "holidays", "vacation", "vacations", "school closure"],
  },
  exams: {
    label: "Examinations",
    description: "Examination dates, class/grade details and assessment schedules published by the academy.",
    aliases: ["exam", "exams", "examination", "examinations", "test", "tests", "assessment"],
  },
};

export function isRealCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function calendarCategoryKey(value: unknown): CalendarCategoryKey | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (!normalized) return null;
  const words = ` ${normalized} `;
  for (const [key, config] of Object.entries(calendarCategories) as Array<[CalendarCategoryKey, (typeof calendarCategories)[CalendarCategoryKey]]>) {
    if (config.aliases.some((alias) => words.includes(` ${alias} `))) return key;
  }
  return null;
}

export function isPublicCalendarEntry(value: unknown): value is CalendarEntry {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const entry = value as Partial<CalendarEntry>;
  return Boolean(
    entry.active === true &&
    typeof entry.title === "string" && entry.title.trim() &&
    isRealCalendarDate(entry.date) &&
    (!entry.endDate || (isRealCalendarDate(entry.endDate) && entry.endDate >= entry.date)) &&
    typeof entry.description === "string" && entry.description.trim() &&
    calendarCategoryKey(entry.category),
  );
}

function todayInIndia(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || "";
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

export function sortCalendarEntries(entries: CalendarEntry[], now = new Date()): CalendarEntry[] {
  const today = todayInIndia(now);
  return [...entries].sort((a, b) => {
    const dateA = a.endDate || a.date || "9999-12-31";
    const dateB = b.endDate || b.date || "9999-12-31";
    const aPast = dateA < today;
    const bPast = dateB < today;
    if (aPast !== bPast) return aPast ? 1 : -1;
    return aPast ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
  });
}


/** A downloadable school resource is public only when it has been approved and has a safe URL. */
export function isPublicCalendarResource(resource: CalendarResource): boolean {
  if (!resource || typeof resource !== "object" || Array.isArray(resource)) return false;
  if (resource.active !== true) return false;
  if (typeof resource.id !== "string" || !resource.id.trim()) return false;
  if (typeof resource.title !== "string" || !resource.title.trim()) return false;
  if (typeof resource.description !== "string" || !resource.description.trim()) return false;
  if (typeof resource.documentUrl !== "string") return false;
  if (resource.kind !== "school-calendar" && resource.kind !== "exam-timetable") return false;
  if (resource.kind === "exam-timetable" && (typeof resource.className !== "string" || !resource.className.trim())) return false;
  if (resource.documentType !== undefined && resource.documentType !== "" && (typeof resource.documentType !== "string" || !isSupportedSchoolAttachmentMime(resource.documentType))) return false;
  try {
    const url = new URL(resource.documentUrl);
    if (!["https:", "http:"].includes(url.protocol)) return false;
    if (resource.documentType?.startsWith("image/") && url.protocol !== "https:") return false;
  } catch {
    return false;
  }
  return true;
}

export function sortCalendarResources(resources: CalendarResource[]): CalendarResource[] {
  return [...resources].sort((a, b) => {
    const kindOrder = (a.kind === "school-calendar" ? 0 : 1) - (b.kind === "school-calendar" ? 0 : 1);
    if (kindOrder) return kindOrder;
    const updatedA = typeof a.updatedAt === "string" ? a.updatedAt : "";
    const updatedB = typeof b.updatedAt === "string" ? b.updatedAt : "";
    return updatedB.localeCompare(updatedA) || a.title.localeCompare(b.title);
  });
}
