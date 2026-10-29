const imageKeys = new Set([
  "image",
  "imageUrl",
  "noticeImage",
  "introImage",
  "heroImage",
  "backgroundImage",
  "portrait",
  "logoUrl",
  "socialImage",
  "thumbnail",
  "coverImage",
]);
const linkKeys = new Set([
  "href",
  "url",
  "instagram",
  "websiteUrl",
  "documentUrl",
  "attachmentUrl",
  "primaryHref",
  "secondaryHref",
  "primaryLink",
  "secondaryLink",
  "enquiryHref",
  "introButtonHref",
  "ctaSecondaryHref",
]);

export function safeHref(input: unknown, fallback = ""): string {
  if (typeof input !== "string") return fallback;
  const value = input.trim();
  if (!value || value.startsWith("//") || value.startsWith("\\\\"))
    return fallback;
  if (value.startsWith("/") && !value.startsWith("/\\")) {
    // The singular route is canonical. Normalize legacy CMS links before saving.
    if (/^\/admissions(?=$|[/?#])/.test(value)) {
      return value.replace(/^\/admissions(?=$|[/?#])/, "/admission");
    }
    return value;
  }
  if (value.startsWith("#")) return value;
  try {
    const url = new URL(value);
    if (["https:", "http:", "mailto:", "tel:"].includes(url.protocol))
      return value;
  } catch {
    /* Not an absolute URL. */
  }
  return fallback;
}

export function safeImageSrc(
  input: unknown,
  fallback = "/images/learning-together.webp",
): string {
  if (typeof input !== "string") return fallback;
  const value = input.trim();
  if (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\") &&
    !/\.svg(?:[?#].*)?$/i.test(value)
  )
    return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && url.hostname === "res.cloudinary.com" && !/\.svg(?:[?#].*)?$/i.test(url.pathname))
      return value;
  } catch {
    /* Use the fallback for unsupported sources. */
  }
  return fallback;
}

export function sanitizeContent<T>(input: T, key = ""): T {
  if (typeof input === "string") {
    if (imageKeys.has(key)) {
      if (!input.trim() && (key === "portrait" || key === "imageUrl")) return "" as T;
      const fallback = key === "imageUrl"
        ? ""
        : key === "logoUrl"
          ? "/images/crest.webp"
          : key === "socialImage"
            ? "/images/campus-illustration.webp"
            : "/images/learning-together.webp";
      return safeImageSrc(input, fallback) as T;
    }
    if (linkKeys.has(key)) {
      if (key === "documentUrl" || key === "attachmentUrl") {
        const value = typeof input === "string" ? input.trim() : "";
        if (value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")) return value as T;
        try {
          const url = new URL(value);
          return (["https:", "http:"].includes(url.protocol) ? value : "") as T;
        } catch {
          return "" as T;
        }
      }
      return safeHref(
        input,
        key === "instagram"
          ? "https://www.instagram.com/shri_gurukul_academy_new_lepa/"
          : "",
      ) as T;
    }
    return input;
  }
  if (imageKeys.has(key) && input !== undefined && input !== null) {
    const fallback = key === "imageUrl" || key === "portrait" ? "" : key === "logoUrl" ? "/images/crest.webp" : key === "socialImage" ? "/images/campus-illustration.webp" : "/images/learning-together.webp";
    return fallback as T;
  }
  if ((key === "documentUrl" || key === "attachmentUrl") && input !== undefined && input !== null) return "" as T;
  if (Array.isArray(input))
    return input.map((item) => sanitizeContent(item)) as T;
  if (input && typeof input === "object") {
    const entries = Object.entries(input as Record<string, unknown>).map(
      ([childKey, value]) =>
        [childKey, sanitizeContent(value, childKey)] as const,
    );
    const result = Object.fromEntries(entries) as Record<string, unknown>;
    // Planner-image publishing has been retired in favour of structured
    // event/holiday/exam records. Strip legacy settings so they cannot reappear
    // in the public renderer or the visual CMS editor after reading old MongoDB data.
    const pages = result.pages;
    if (pages && typeof pages === "object" && !Array.isArray(pages)) {
      const calendar = (pages as Record<string, unknown>).calendar;
      if (calendar && typeof calendar === "object" && !Array.isArray(calendar)) {
        const calendarRecord = calendar as Record<string, unknown>;
        for (const legacyKey of [
          "calendarPlanners",
          "calendarBlockEyebrow",
          "calendarBlockTitle",
          "calendarBlockDescription",
          "calendarSession",
          "calendarPostedBy",
          "calendarEmptyText",
        ]) delete calendarRecord[legacyKey];
      }
    }
    return result as T;
  }
  return input;
}
