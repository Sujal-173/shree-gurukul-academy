import { describe, expect, it } from "vitest";
import { getPublishedLeaders, publishCompleteLegacyLeaders } from "../lib/leadership";
import { validatePublishedLeadership } from "../lib/leadership-validation";

describe("CMS-managed leadership profiles", () => {
  it("does not display sample, draft or incomplete profiles", () => {
    expect(getPublishedLeaders([
      { role: "Director", name: "Sample Person", message: "Draft only", portrait: "", active: false },
      { role: "Principal", name: "Unpublished Person", portrait: "/principal.webp", active: false },
      { role: "Chairman", name: "No portrait", portrait: "", active: true },
    ])).toEqual([]);
  });

  it("returns only explicitly published profiles with role, name and portrait", () => {
    const profiles = [
      { role: "Director", name: "A. Person", designation: "School Management", message: "", portrait: "https://res.cloudinary.com/demo/image/upload/director.webp", alt: "Director portrait", active: true },
      { role: "Principal", name: "B. Person", portrait: "/principal.webp", active: false },
    ];
    expect(getPublishedLeaders(profiles)).toEqual([profiles[0]]);
  });

  it("keeps complete profiles created before publication controls were added visible", () => {
    const profiles = publishCompleteLegacyLeaders([
      { role: "Director", name: "A. Person", designation: "", message: "", portrait: "/director.webp", alt: "" },
      { role: "Principal", name: "", designation: "", message: "", portrait: "/principal.webp", alt: "" },
      { role: "Draft", name: "B. Person", designation: "", message: "", portrait: "/draft.webp", alt: "", active: false },
    ]);

    expect(profiles[0].active).toBe(true);
    expect(profiles[1].active).toBeUndefined();
    expect(profiles[2].active).toBe(false);
    expect(getPublishedLeaders(profiles)).toEqual([profiles[0]]);
  });

  it("requires the role, name and portrait before a profile can be published", () => {
    expect(validatePublishedLeadership({ home: { leaders: [{ active: true, role: "Director", name: "A. Person", portrait: "" }] } })).toMatch(/portrait/i);
    expect(validatePublishedLeadership({ home: { leaders: [{ active: true, role: "Director", name: "A. Person", portrait: "https://example.com/person.jpg" }] } })).toMatch(/Cloudinary/i);
    expect(validatePublishedLeadership({ home: { leaders: [{ active: true, role: "", name: "A. Person", portrait: "/person.webp" }] } })).toMatch(/role/i);
    expect(validatePublishedLeadership({ home: { leaders: [{ active: true, role: "Principal", name: "B. Person", portrait: "/person.webp" }] } })).toBeNull();
  });

  it("allows incomplete profiles to be saved as drafts", () => {
    expect(validatePublishedLeadership({ home: { leaders: [{ active: false, role: "", name: "", portrait: "" }] } })).toBeNull();
  });

  it("limits the optional highlighted quote on published profiles", () => {
    expect(validatePublishedLeadership({
      home: {
        leaders: [{
          active: true,
          role: "Director",
          name: "A. Person",
          portrait: "/person.webp",
          quote: "A".repeat(1001),
        }],
      },
    })).toMatch(/highlighted quote/i);
  });
});
