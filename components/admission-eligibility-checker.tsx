"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { Icon } from "@/components/icon";
import {
  checkAdmissionEligibility,
  getCurrentAcademicSessionStartYear,
  getTodayInIndiaISO,
  type AdmissionEligibilityResult,
} from "@/lib/admission-eligibility";

const subscribeToSessionClock = () => () => {};
const getSessionStartYear = () => getCurrentAcademicSessionStartYear();
const getToday = () => getTodayInIndiaISO();
const getServerSessionStartYear = () => null;
const getServerToday = () => "";

function formatAge(age: { years: number; months: number; days: number }) {
  const yearLabel = age.years === 1 ? "year" : "years";
  const monthLabel = age.months === 1 ? "month" : "months";
  return `${age.years} ${yearLabel}, ${age.months} ${monthLabel}`;
}

export function AdmissionEligibilityChecker() {
  const sessionStartYear = useSyncExternalStore(
    subscribeToSessionClock,
    getSessionStartYear,
    getServerSessionStartYear,
  );
  const today = useSyncExternalStore(
    subscribeToSessionClock,
    getToday,
    getServerToday,
  );
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [result, setResult] = useState<AdmissionEligibilityResult | null>(null);

  function checkEligibility(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sessionStartYear === null) return;
    setResult(checkAdmissionEligibility(dateOfBirth, sessionStartYear));
  }

  const sessionLabel = sessionStartYear === null
    ? "current"
    : `${sessionStartYear}–${String(sessionStartYear + 1).slice(-2)}`;

  return (
    <div className="admission-eligibility-checker">
      <h3><Icon name="calendar-check" size={17} /> Check Eligibility</h3>
      <p>
        Enter the student&apos;s date of birth. Age is calculated on 31 March for
        the {sessionLabel} academic session.
      </p>
      <form className="admission-eligibility-form" onSubmit={checkEligibility}>
        <label className="visually-hidden" htmlFor="admission-date-of-birth">Student&apos;s date of birth</label>
        <input
          id="admission-date-of-birth"
          name="dateOfBirth"
          type="date"
          required
          max={today || undefined}
          value={dateOfBirth}
          onChange={(event) => {
            setDateOfBirth(event.target.value);
            setResult(null);
          }}
          aria-describedby="admission-eligibility-disclaimer"
        />
        <button className="button button-primary" disabled={sessionStartYear === null} type="submit">
          <Icon name="search" size={16} /> Check now
        </button>
      </form>

      {result && (
        <div
          aria-live="polite"
          className={`admission-eligibility-result ${result.status === "eligible" ? "is-eligible" : "is-ineligible"}`}
          role="status"
        >
          {result.status === "invalid" && <p>Please enter a valid date of birth.</p>}
          {result.status === "future" && <p>The date of birth must be on or before 31 March {sessionStartYear}.</p>}
          {result.status === "underage" && (
            <>
              <strong><Icon name="close" size={17} /> The minimum age guideline is not met for Class 1.</strong>
              <p>Age on 31 March {sessionStartYear}: {formatAge(result.age)}. Please contact the school to confirm its current age criteria.</p>
            </>
          )}
          {result.status === "eligible" && (
            <>
              <strong><Icon name="check-circle" size={17} /> Meets the indicative minimum age guideline</strong>
              <p>
                Age on 31 March {sessionStartYear}: {formatAge(result.age)}.
                Indicative age-based class: <b>Class {result.recommendedClass}</b>.
              </p>
              <p className="admission-eligibility-next-step">
                Class placement for Classes 2–10 depends on the previous school&apos;s
                transfer certificate and marksheet. Confirm final eligibility,
                class availability and age rules with the academy.
              </p>
              <a className="admission-eligibility-continue" href="#enquiry">
                Continue to admission enquiry
              </a>
            </>
          )}
        </div>
      )}

      <p className="admission-eligibility-disclaimer" id="admission-eligibility-disclaimer">
        This checker is a guide, not an admission decision. Please confirm the
        academy&apos;s current official criteria with the school office.
      </p>
    </div>
  );
}
