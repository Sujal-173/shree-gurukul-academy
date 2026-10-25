/** Whitelisted page scopes accepted by the admin CMS save endpoint. */
export const allowedContentScopes = new Set([
  "home", "about", "academics", "admissions", "facilities", "school-life", "notices",
  "gallery", "vision", "contact", "disclosure", "calendar", "privacy", "site-settings",
]);

/**
 * Merge a page-specific editor draft into the latest persisted site content.
 * This keeps saves from one editor from overwriting unrelated pages edited elsewhere.
 * Passing no scope to the API intentionally retains the full-site editor behavior.
 */
export function mergeScopedContent(currentValue: unknown, incomingValue: unknown, scope: string): unknown {
  const current = currentValue && typeof currentValue === "object" && !Array.isArray(currentValue)
    ? currentValue as Record<string, unknown>
    : {};
  const incoming = incomingValue && typeof incomingValue === "object" && !Array.isArray(incomingValue)
    ? incomingValue as Record<string, unknown>
    : {};
  if (!currentValue || typeof currentValue !== "object" || Array.isArray(currentValue)) return incomingValue;
  if (scope === "home") return { ...current, home: incoming.home };
  if (scope === "site-settings") {
    return { ...current, brand: incoming.brand, navigation: incoming.navigation, footer: incoming.footer, seo: incoming.seo };
  }
  const currentPages = current.pages && typeof current.pages === "object" && !Array.isArray(current.pages) ? current.pages as Record<string, unknown> : {};
  const incomingPages = incoming.pages && typeof incoming.pages === "object" && !Array.isArray(incoming.pages) ? incoming.pages as Record<string, unknown> : {};
  const pageKey = scope === "school-life" ? "schoolLife" : scope;
  if (!Object.prototype.hasOwnProperty.call(incomingPages, pageKey)) throw new Error(`Missing page content for scope: ${scope}`);
  return { ...current, pages: { ...currentPages, [pageKey]: incomingPages[pageKey] } };
}
