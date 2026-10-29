import { describe, expect, it } from "vitest";
import { combinePublishedNotices } from "../lib/notices";
import type { NoticeItem } from "../lib/types";

const notice = (overrides: Partial<NoticeItem>): NoticeItem => ({
  id: "notice-1",
  category: "Circular",
  title: "Term I Examination Timetable",
  date: "30 Oct 2026",
  description: "Please check the attached timetable.",
  active: true,
  ...overrides,
});

describe("combinePublishedNotices", () => {
  it("combines home and notice-board records without repeated IDs", () => {
    const page = notice({ description: "Full notice-board details." });
    const home = notice({ description: "Short homepage teaser." });
    expect(combinePublishedNotices([page], [home])).toEqual([page]);
  });

  it("deduplicates matching title/date records even when an old CMS record has no shared ID", () => {
    const page = notice({ id: "board-copy", description: "The full details." });
    const home = notice({ id: "home-copy", description: "A teaser for the same notice." });
    expect(combinePublishedNotices([page], [home])).toEqual([page]);
  });

  it("ignores malformed rows and normalizes away unsafe attachment URLs", () => {
    const unsafe = notice({ id: "unsafe", imageUrl: "javascript:alert(1)", attachmentUrl: "javascript:alert(1)" });
    const result = combinePublishedNotices([null, unsafe, { active: true, title: "", description: "No title" }], []);
    expect(result).toHaveLength(1);
    expect(result[0].imageUrl).toBeUndefined();
    expect(result[0].attachmentUrl).toBeUndefined();
  });

  it("keeps the same notice title when the date differs and hides drafts", () => {
    const first = notice({ id: "one", date: "30 Oct 2026" });
    const second = notice({ id: "two", date: "30 Nov 2026" });
    const draft = notice({ id: "draft", title: "Internal draft", active: false });
    expect(combinePublishedNotices([first, second, draft], [])).toEqual([first, second]);
  });
});
