import { safeImageSrc } from "./sanitize-content";

/** Validate only records that an administrator is trying to publish publicly. */
export function validatePublishedLeadership(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const home = (value as Record<string, unknown>).home;
  if (!home || typeof home !== "object" || Array.isArray(home)) return null;
  const leaders = (home as Record<string, unknown>).leaders;
  if (!Array.isArray(leaders)) return null;

  for (const [index, rawProfile] of leaders.entries()) {
    if (!rawProfile || typeof rawProfile !== "object" || Array.isArray(rawProfile)) continue;
    const profile = rawProfile as Record<string, unknown>;
    if (profile.active !== true) continue;
    const position = `Leadership profile ${index + 1}`;
    if (typeof profile.role !== "string" || !profile.role.trim()) return `${position}: add the person's official role before publishing.`;
    if (typeof profile.name !== "string" || !profile.name.trim()) return `${position}: add the person's full name before publishing.`;
    if (typeof profile.portrait !== "string" || !profile.portrait.trim()) return `${position}: upload an approved portrait before publishing.`;
    if (!safeImageSrc(profile.portrait, "")) return `${position}: use an uploaded site image or a Cloudinary portrait URL.`;
    if (profile.role.length > 100 || profile.name.length > 120) return `${position}: the role or name is too long.`;
    if (typeof profile.quote === "string" && profile.quote.length > 1000) return `${position}: keep the highlighted quote under 1,000 characters.`;
    if (typeof profile.message === "string" && profile.message.length > 2400) return `${position}: keep the profile introduction under 2,400 characters.`;
  }
  return null;
}
