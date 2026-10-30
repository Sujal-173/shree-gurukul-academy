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

  return input.filter((candidate): candidate is LeaderProfile => {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      return false;
    }

    const profile = candidate as Record<string, unknown>;
    return profile.active === true
      && typeof profile.role === "string" && profile.role.trim().length > 0
      && typeof profile.name === "string" && profile.name.trim().length > 0
      && typeof profile.portrait === "string" && profile.portrait.trim().length > 0;
  });
}
