import type { LeaderProfile } from "@/lib/types";

export function publishCompleteLegacyLeaders(input: LeaderProfile[]): LeaderProfile[] {
  return input.map((leader) => {
    if (!leader || typeof leader !== "object" || leader.active !== undefined) return leader;
    if (
      typeof leader.role === "string" && leader.role.trim()
      && typeof leader.name === "string" && leader.name.trim()
      && typeof leader.portrait === "string" && leader.portrait.trim()
    ) {
      return { ...leader, active: true };
    }
    return leader;
  });
}

/**
 * Only explicitly published, complete profiles belong on public pages.
 * Requiring a role, name and portrait prevents sample or unfinished CMS rows
 * from appearing as real school leadership.
 */
export function getPublishedLeaders(input: unknown): LeaderProfile[] {
  if (!Array.isArray(input)) return [];

  const published: LeaderProfile[] = [];
  const seen = new Set<string>();
  for (const candidate of input) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) continue;
    const profile = candidate as Record<string, unknown>;
    if (profile.active !== true
      || typeof profile.role !== "string" || !profile.role.trim()
      || typeof profile.name !== "string" || !profile.name.trim()
      || typeof profile.portrait !== "string" || !profile.portrait.trim()) continue;

    // CMS imports and earlier manual edits can contain the same leader more than once.
    // Keep the first complete published profile for each normalized name + official role.
    const identity = `${profile.name.trim().toLocaleLowerCase()}|${profile.role.trim().toLocaleLowerCase()}`;
    if (seen.has(identity)) continue;
    seen.add(identity);
    published.push(profile as LeaderProfile);
  }
  return published;
}
