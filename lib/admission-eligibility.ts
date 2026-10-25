export type AgeAtCutoff = {
  years: number;
  months: number;
  days: number;
};

export type AdmissionEligibilityResult =
  | { status: "invalid" }
  | { status: "future"; age: AgeAtCutoff }
  | { status: "underage"; age: AgeAtCutoff }
  | { status: "eligible"; age: AgeAtCutoff; recommendedClass: number };

function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export function calculateAgeOnDate(
  dateOfBirth: string,
  cutoff: string,
): AgeAtCutoff | null {
  const birthDate = parseDate(dateOfBirth);
  const cutoffDate = parseDate(cutoff);
  if (!birthDate || !cutoffDate || birthDate > cutoffDate) return null;

  let years = cutoffDate.getUTCFullYear() - birthDate.getUTCFullYear();
  let months = cutoffDate.getUTCMonth() - birthDate.getUTCMonth();
  let days = cutoffDate.getUTCDate() - birthDate.getUTCDate();

  if (days < 0) {
    months -= 1;
    const previousMonthLastDay = new Date(
      Date.UTC(cutoffDate.getUTCFullYear(), cutoffDate.getUTCMonth(), 0),
    ).getUTCDate();
    days += previousMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

export function checkAdmissionEligibility(
  dateOfBirth: string,
  sessionStartYear: number,
): AdmissionEligibilityResult {
  const birthDate = parseDate(dateOfBirth);
  const cutoff = `${sessionStartYear}-03-31`;
  const cutoffDate = parseDate(cutoff);

  if (!birthDate || !cutoffDate) return { status: "invalid" };

  const age = calculateAgeOnDate(dateOfBirth, cutoff);
  if (!age) return { status: "future", age: { years: 0, months: 0, days: 0 } };
  if (age.years < 6) return { status: "underage", age };

  return {
    status: "eligible",
    age,
    recommendedClass: Math.min(age.years - 5, 10),
  };
}

export function getCurrentAcademicSessionStartYear(date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
  }).formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);

  return month >= 4 ? year : year - 1;
}

export function getTodayInIndiaISO(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: "year" | "month" | "day") =>
    parts.find((item) => item.type === type)?.value || "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}
