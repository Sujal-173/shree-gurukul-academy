import { describe, expect, it } from "vitest";
import { calendarCategoryKey, isPublicCalendarEntry, isPublicCalendarResource, isRealCalendarDate, sortCalendarEntries, sortCalendarResources } from "../lib/calendar";
import type { CalendarEntry, CalendarResource } from "../lib/types";

const publishedEvent: CalendarEntry = {
  id: "annual-day",
  category: "Events & Celebrations",
  title: "Annual Day",
  date: "2026-12-15",
  endDate: "2026-12-15",
  description: "School programme for students and families.",
  active: true,
};

describe("school calendar records", () => {
  it("normalizes event, holiday and exam categories", () => {
    expect(calendarCategoryKey("Events & Celebrations")).toBe("events");
    expect(calendarCategoryKey("School Holidays")).toBe("holidays");
    expect(calendarCategoryKey("Examinations")).toBe("exams");
    expect(calendarCategoryKey("Inter-house contest")).toBe("events");
    expect(calendarCategoryKey("Other")).toBeNull();
  });

  it("rejects impossible calendar dates", () => {
    expect(isRealCalendarDate("2026-12-15")).toBe(true);
    expect(isRealCalendarDate("2026-02-31")).toBe(false);
    expect(isRealCalendarDate("15-12-2026")).toBe(false);
  });

  it("shows only complete published records and rejects invalid end dates", () => {
    expect(isPublicCalendarEntry(publishedEvent)).toBe(true);
    expect(isPublicCalendarEntry({ ...publishedEvent, active: false })).toBe(false);
    expect(isPublicCalendarEntry({ ...publishedEvent, description: " " })).toBe(false);
    expect(isPublicCalendarEntry({ ...publishedEvent, endDate: "2026-12-14" })).toBe(false);
    expect(isPublicCalendarEntry(null)).toBe(false);
    expect(isPublicCalendarEntry({ active: true, title: {}, date: "2026-12-15" })).toBe(false);
  });

  it("sorts upcoming dates ahead of past entries and keeps upcoming dates ascending", () => {
    const entries: CalendarEntry[] = [
      { ...publishedEvent, id: "late", date: "2027-01-04", endDate: "2027-01-04" },
      { ...publishedEvent, id: "past", date: "2026-10-10", endDate: "2026-10-10" },
      { ...publishedEvent, id: "soon", date: "2026-11-02", endDate: "2026-11-02" },
    ];
    const sorted = sortCalendarEntries(entries, new Date("2026-10-30T00:00:00.000Z"));
    expect(sorted.map((entry) => entry.id)).toEqual(["soon", "late", "past"]);
  });
});


describe("calendar document resources", () => {
  const timetable: CalendarResource = {
    id: "term-one-timetable",
    kind: "exam-timetable",
    title: "Term I examination timetable",
    description: "Exam dates and subjects for Classes 6–10.",
    className: "Classes 6–10",
    academicYear: "2026–27",
    documentUrl: "https://res.cloudinary.com/example/raw/upload/timetable.pdf",
    documentName: "timetable.pdf",
    documentType: "application/pdf",
    active: true,
  };

  it("exposes only complete, active resources with an HTTP(S) attachment", () => {
    expect(isPublicCalendarResource(timetable)).toBe(true);
    expect(isPublicCalendarResource({ ...timetable, active: false })).toBe(false);
    expect(isPublicCalendarResource({ ...timetable, description: " " })).toBe(false);
    expect(isPublicCalendarResource({ ...timetable, className: "" })).toBe(false);
    expect(isPublicCalendarResource({ ...timetable, documentUrl: "javascript:alert(1)" })).toBe(false);
    expect(isPublicCalendarResource({ ...timetable, kind: "exam-timetable", className: undefined })).toBe(false);
  });

  it("sorts the school calendar before class-wise timetables", () => {
    const schoolCalendar: CalendarResource = {
      ...timetable,
      id: "school-calendar",
      kind: "school-calendar",
      title: "School calendar 2026–27",
      className: "",
      documentUrl: "https://res.cloudinary.com/example/raw/upload/calendar.pdf",
    };
    expect(sortCalendarResources([timetable, schoolCalendar]).map((item) => item.id)).toEqual(["school-calendar", "term-one-timetable"]);
  });
});
