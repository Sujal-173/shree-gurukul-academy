const PRODUCTION_SITE_URL = "https://www.shrigurukulacademy.in";

export function getSiteUrl(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || PRODUCTION_SITE_URL;
  let url: URL;
  try {
    url = new URL(configuredUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute http or https URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use http or https.");
  }
  return new URL(url.origin);
}
