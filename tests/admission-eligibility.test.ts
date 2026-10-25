import { describe, expect, it } from "vitest";
import {
  calculateAgeOnDate,
  checkAdmissionEligibility,
  getCurrentAcademicSessionStartYear,
  getTodayInIndiaISO,
} from "../lib/admission-eligibility";

describe("admission eligibility checker", () => {
  it("calculates exact age as of the session cutoff", () => {
    expect(calculateAgeOnDate("2016-07-09", "2026-03-31")).toEqual({
      years: 9,
      months: 8,
      days: 22,
    });
  });

  it("includes a child who turns six on the cutoff date", () => {
    expect(checkAdmissionEligibility("2020-03-31", 2026)).toEqual({
      status: "eligible",
      age: { years: 6, months: 0, days: 0 },
      recommendedClass: 1,
    });
  });

  it("does not qualify a child who turns six after the cutoff", () => {
    expect(checkAdmissionEligibility("2020-04-01", 2026)).toEqual({
      status: "underage",
      age: { years: 5, months: 11, days: 30 },
    });
  });

  it("suggests an indicative class based on completed years and caps it at class ten", () => {
    expect(checkAdmissionEligibility("2016-07-09", 2026)).toMatchObject({
      status: "eligible",
      recommendedClass: 4,
    });
    expect(checkAdmissionEligibility("2000-01-01", 2026)).toMatchObject({
      status: "eligible",
      recommendedClass: 10,
    });
  });

  it("rejects invalid dates and dates after the cutoff", () => {
    expect(checkAdmissionEligibility("2020-02-30", 2026).status).toBe("invalid");
    expect(checkAdmissionEligibility("2026-04-01", 2025).status).toBe("future");
    expect(calculateAgeOnDate("2020-04-01", "2020-03-31")).toBeNull();
  });

  it("uses the Indian academic session and calendar date", () => {
    expect(getCurrentAcademicSessionStartYear(new Date("2026-10-24T12:00:00Z"))).toBe(2026);
    expect(getCurrentAcademicSessionStartYear(new Date("2026-02-10T12:00:00Z"))).toBe(2025);
    expect(getTodayInIndiaISO(new Date("2026-10-24T20:00:00Z"))).toBe("2026-10-25");
  });
});
