import { cache } from "react";
import { unstable_cache } from "next/cache";
import { defaultContent } from "@/lib/default-content";
import { getDb } from "@/lib/db";
import { sanitizeContent } from "@/lib/sanitize-content";
import type { SiteContent } from "@/lib/types";

function deepMerge<T>(base: T, override: unknown): T {
  if (Array.isArray(base)) return (Array.isArray(override) ? override : base) as T;
  if (base && typeof base === "object") {
    const source = override && typeof override === "object" && !Array.isArray(override) ? override as Record<string, unknown> : {};
    const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [key, value] of Object.entries(source)) {
      result[key] = Object.prototype.hasOwnProperty.call(result, key) ? deepMerge(result[key], value) : value;
    }
    return result as T;
  }
  return (override === undefined ? base : override) as T;
}

const getCachedContent = unstable_cache(
  async () => {
    const db = await getDb();
    const saved = await db.collection<{ _id: string; content: unknown }>("siteContent").findOne(
      { _id: "primary" },
      { projection: { content: 1 } },
    );
    return saved?.content ?? null;
  },
  ["gurukul-site-content"],
  { tags: ["site-content"] },
);

export const getSiteContent = cache(async function loadSiteContent(): Promise<SiteContent> {
  if (!process.env.MONGODB_URI) return sanitizeContent(structuredClone(defaultContent));
  try {
    const savedContent = await getCachedContent();
    if (!savedContent) return sanitizeContent(structuredClone(defaultContent));
    const content = sanitizeContent(deepMerge(structuredClone(defaultContent), savedContent));
    const calendar = content.pages.calendar;
    const legacyCalendarCopy: Record<string, string> = {
      subtitle: "A place for dates and events confirmed by the school administration.",
      calendarBlockEyebrow: "SCHOOL SCHEDULE",
      calendarBlockTitle: "Dates published by the academy",
      calendarBlockDescription: "Check back for announcements and confirmed events. Please contact the school directly if a date is urgent or has changed.",
      calendarEmptyText: "No dated events are published at the moment. Confirm the current academic calendar with the school office.",
    };
    for (const [key, legacyValue] of Object.entries(legacyCalendarCopy)) {
      if (calendar[key] === legacyValue && typeof defaultContent.pages.calendar[key] === "string") {
        calendar[key] = defaultContent.pages.calendar[key];
      }
    }
    if (content.pages.facilities.title === "Learning & School Life") {
      content.pages.facilities.title = defaultContent.pages.facilities.title;
    }
    if (content.home.noticesEyebrow === "STAY INFORMED") {
      content.home.noticesEyebrow = defaultContent.home.noticesEyebrow;
    }
    if (content.home.noticesTitle === "Notices & updates") {
      content.home.noticesTitle = defaultContent.home.noticesTitle;
    }
    if (
      content.home.introBody ===
      "Shri Gurukul Academy New Lepa serves families in the Lepa area with schooling for Classes 1–10. We believe that a meaningful education should build understanding, encourage curiosity and help students grow with respect for others. Contact the school to learn more about its current programmes, facilities and admission process."
    ) {
      content.home.introBody = defaultContent.home.introBody;
    }
    const legacyAboutCopy: Record<string, string> = {
      subtitle: "Get to know Shri Gurukul Academy New Lepa and its approach to learning.",
      heading: "A place to learn, grow and build character",
      body: "Shri Gurukul Academy New Lepa is located in Lepa, Kasrawad, in Khargone district of Madhya Pradesh. The academy serves students in Classes 1–10. This website is designed to help families find school information and contact the administration directly for current, verified details.",
      sectionTitle: "What matters in a school journey",
      sectionSubtitle: "The principles that guide a supportive learning experience.",
      commitmentTitle: "Good foundations make room for growth.",
      commitmentBody: "Families should be able to access clear school information, ask questions and get guidance directly from the academy.",
      commitmentPoints: "Clear communication\nRespect for every learner\nSteady learning habits",
    };
    for (const [key, legacyValue] of Object.entries(legacyAboutCopy)) {
      if (content.pages.about[key] === legacyValue) {
        content.pages.about[key] = defaultContent.pages.about[key];
      }
    }
    const legacyAboutSections = [
      {
        title: "Learning with purpose",
        description: "Strong foundations grow through clear explanations, regular practice, healthy routines and a supportive partnership between families and school.",
      },
      {
        title: "Character and respect",
        description: "Students benefit from learning to be responsible, listen to others, work cooperatively and take pride in honest effort.",
      },
      {
        title: "A community partnership",
        description: "Parents and guardians are encouraged to contact the school with questions about teaching, attendance, progress and admissions.",
      },
    ];
    if (JSON.stringify(content.pages.about.sections) === JSON.stringify(legacyAboutSections)) {
      content.pages.about.sections = structuredClone(defaultContent.pages.about.sections);
    }
    if (
      content.seo.description ===
      "Contact Shri Gurukul Academy New Lepa in Lepa, Kasrawad, Khargone, Madhya Pradesh for school information and admission enquiries for Classes 1–10."
    ) {
      content.seo.description = defaultContent.seo.description;
    }
    const legacySeoKeywords = [
      "Shri Gurukul Academy New Lepa",
      "Gurukul Academy Lepa",
      "school in Kasrawad",
      "school in Khargone",
      "admissions Classes 1–10",
    ];
    if (JSON.stringify(content.seo.keywords) === JSON.stringify(legacySeoKeywords)) {
      content.seo.keywords = [...defaultContent.seo.keywords];
    }
    return content;
  } catch (error) {
    console.error("Could not load CMS content; using safe defaults.", error instanceof Error ? error.message : "Unknown error");
    return sanitizeContent(structuredClone(defaultContent));
  }
});
