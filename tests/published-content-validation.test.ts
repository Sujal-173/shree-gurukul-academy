import { describe, expect, it } from "vitest";
import {
  validatePublishedCalendarRecords,
  validatePublishedCalendarResources,
  validatePublishedNoticeRecords,
} from "../lib/published-content-validation";

const baseContent = {
  home: { notices: [] as unknown[] },
  pages: {
    calendar: {
      calendarEntries: [] as unknown[],
      calendarResources: [] as unknown[],
    },
    notices: { notices: [] as unknown[] },
  },
};

describe("published CMS content validation", () => {
  it("requires a real date and family-facing description for a published calendar entry", () => {
    const valid = structuredClone(baseContent);
    valid.pages.calendar.calendarEntries.push({
      id: "annual-day",
      category: "Events & Celebrations",
      title: "Annual Day",
      date: "2026-12-15",
      description: "A school programme for students and families.",
      active: true,
    });
    expect(validatePublishedCalendarRecords(valid)).toBeNull();

    const invalid = structuredClone(valid);
    (invalid.pages.calendar.calendarEntries[0] as { date: string }).date = "2026-02-31";
    expect(validatePublishedCalendarRecords(invalid)).toContain("valid start date");
  });

  it("requires a class label, description and attachment for a published examination timetable", () => {
    const invalid = structuredClone(baseContent);
    invalid.pages.calendar.calendarResources.push({
      id: "term-one",
      kind: "exam-timetable",
      title: "Term I timetable",
      description: "Exam dates and subjects.",
      className: "",
      documentUrl: "https://res.cloudinary.com/example/raw/upload/timetable.pdf",
      documentType: "application/pdf",
      active: true,
    });
    expect(validatePublishedCalendarResources(invalid)).toContain("class or grade");

    (invalid.pages.calendar.calendarResources[0] as { className: string }).className = "Classes 6–10";
    expect(validatePublishedCalendarResources(invalid)).toBeNull();

    (invalid.pages.calendar.calendarResources[0] as { documentUrl: string }).documentUrl = "javascript:alert(1)";
    expect(validatePublishedCalendarResources(invalid)).toContain("HTTP or HTTPS");
  });

  it("validates image and PDF references on active notices without blocking unrelated scoped edits", () => {
    const invalid = structuredClone(baseContent);
    invalid.pages.notices.notices.push({
      id: "notice-1",
      category: "Circular",
      title: "Term I circular",
      date: "30 Oct 2026",
      description: "Please read the attached circular.",
      imageUrl: "javascript:alert(1)",
      active: true,
    });
    expect(validatePublishedNoticeRecords(invalid, "notices")).toContain("local site image or an HTTPS Cloudinary raster image");
    expect(validatePublishedNoticeRecords(invalid, "home")).toBeNull();

    (invalid.pages.notices.notices[0] as { imageUrl: string }).imageUrl = "/images/circular.webp";
    (invalid.pages.notices.notices[0] as { attachmentUrl?: string }).attachmentUrl = "https://res.cloudinary.com/example/raw/upload/circular.pdf";
    (invalid.pages.notices.notices[0] as { attachmentType?: string }).attachmentType = "application/pdf";
    expect(validatePublishedNoticeRecords(invalid, "notices")).toBeNull();
    (invalid.pages.notices.notices[0] as { attachmentType?: string }).attachmentType = "image/svg+xml";
    expect(validatePublishedNoticeRecords(invalid, "notices")).toContain("approved image format or PDF");
    (invalid.pages.notices.notices[0] as { imageUrl: unknown }).imageUrl = { unexpected: "object" };
    expect(validatePublishedNoticeRecords(invalid, "notices")).toContain("valid image URL");
  });
});

// In addition to the happy paths above, the validators intentionally ignore
// incomplete draft records so editors can save work before publishing it.
describe("draft publishing behavior", () => {
  it("allows incomplete calendar records while they remain drafts", () => {
    const draft = structuredClone(baseContent);
    draft.pages.calendar.calendarEntries.push({
      id: "future-event",
      category: "Events & Celebrations",
      title: "",
      date: "",
      description: "",
      active: false,
    });
    expect(validatePublishedCalendarRecords(draft)).toBeNull();
  });

  it("does not block a notice editor save because another page has an unfinished notice", () => {
    const content = structuredClone(baseContent);
    content.home.notices.push({ active: true, title: "Approved homepage notice", description: "Details for families.", imageUrl: "" });
    content.pages.notices.notices.push({ active: true, title: "", description: "", imageUrl: "" });
    expect(validatePublishedNoticeRecords(content, "home")).toBeNull();
    expect(validatePublishedNoticeRecords(content, "notices")).toContain("needs a title");
  });
});
