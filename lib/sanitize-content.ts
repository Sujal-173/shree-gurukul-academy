const imageKeys = new Set([
  "image",
  "imageUrl",
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
  if (value.startsWith("/") && !value.startsWith("/\\")) return value;
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
    !value.startsWith("/\\")
  )
    return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && url.hostname === "res.cloudinary.com")
      return value;
  } catch {
    /* Use the fallback for unsupported sources. */
  }
  return fallback;
}

export function sanitizeContent<T>(input: T, key = ""): T {
  if (typeof input === "string") {
    if (imageKeys.has(key)) {
      if (!input.trim() && key === "portrait") return "" as T;
      const fallback =
        key === "logoUrl"
          ? "/images/crest.svg"
          : key === "socialImage"
            ? "/images/campus-illustration.png"
            : "/images/learning-together.webp";
      return safeImageSrc(input, fallback) as T;
    }
    if (linkKeys.has(key))
      return safeHref(
        input,
        key === "instagram"
          ? "https://www.instagram.com/shri_gurukul_academy_new_lepa/"
          : "",
      ) as T;
    return input;
  }
  if (Array.isArray(input))
    return input.map((item) => sanitizeContent(item)) as T;
  if (input && typeof input === "object") {
    const entries = Object.entries(input as Record<string, unknown>).map(
      ([childKey, value]) =>
        [childKey, sanitizeContent(value, childKey)] as const,
    );
    return Object.fromEntries(entries) as T;
  }
  return input;
}
