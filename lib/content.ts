import { cache } from "react";
import { unstable_cache } from "next/cache";
import { defaultContent } from "@/lib/default-content";
import { getDb } from "@/lib/db";
import { sanitizeContent } from "@/lib/sanitize-content";
import copyMigrations from "@/lib/content-copy-migrations.json";
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

function normalizeLegacyRoutes<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(/^\/admissions(?=$|[/?#])/, "/admission").replace(/^\/images\/crest\.svg$/, "/images/crest.webp").replace(/^\/images\/campus-illustration\.png$/, "/images/campus-illustration.webp") as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeLegacyRoutes(item)) as T;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, normalizeLegacyRoutes(item)]);
    return Object.fromEntries(entries) as T;
  }
  return value;
}

export const getSiteContent = cache(async function loadSiteContent(): Promise<SiteContent> {
  if (!process.env.MONGODB_URI) return sanitizeContent(structuredClone(defaultContent));
  try {
    const savedContent = await getCachedContent();
    if (!savedContent) return sanitizeContent(structuredClone(defaultContent));
    const content = sanitizeContent(deepMerge(structuredClone(defaultContent), savedContent));

    // Apply copy updates only when a saved value is still the known prior default.
    // Custom school-approved copy remains untouched.
    const migrateExactCopy = (target: Record<string, unknown>, key: string, previous: string, next: string) => {
      if (target[key] === previous) target[key] = next;
    };
    migrateExactCopy(
      content.home as unknown as Record<string, unknown>,
      "introBody",
      "Shri Gurukul Academy New Lepa serves families in Lepa, Kasrawad, Khargone, with classes listed from 1 to 10. Contact the school directly to confirm current curriculum, admission availability, fees, timings and facilities.",
      defaultContent.home.introBody,
    );
    migrateExactCopy(
      content.pages.about as Record<string, unknown>,
      "body",
      "Shri Gurukul Academy is located in New Lepa, Kasrawad, Khargone district, Madhya Pradesh. The school information provided for this website lists Classes 1–10. Families can contact the academy to confirm current admission availability, curriculum, fees, timings, facilities and official documents.",
      String(defaultContent.pages.about.body),
    );
    migrateExactCopy(
      content.pages.about as Record<string, unknown>,
      "heading",
      "Shri Gurukul Academy New Lepa",
      String(defaultContent.pages.about.heading),
    );
    migrateExactCopy(
      content.pages.about as Record<string, unknown>,
      "heading",
      "Verified information, available in one place",
      String(defaultContent.pages.about.heading),
    );
    migrateExactCopy(
      content.pages.academics as Record<string, unknown>,
      "body",
      "The academy offers classes from 1 to 10. Contact the school office for the current syllabus, medium of instruction, assessment pattern, book list and academic calendar. The grade-stage descriptions below are general summaries and can be edited by the administration.",
      String(defaultContent.pages.academics.body),
    );
    migrateExactCopy(
      content.pages.admissions as Record<string, unknown>,
      "subtitle",
      "Speak with the school to confirm availability and understand the current process.",
      String(defaultContent.pages.admissions.subtitle),
    );
    migrateExactCopy(
      content.pages.admissions as Record<string, unknown>,
      "stepsTitle",
      "A simple enquiry-to-admission journey",
      String(defaultContent.pages.admissions.stepsTitle),
    );
    migrateExactCopy(
      content.pages.admissions as Record<string, unknown>,
      "stepsSubtitle",
      "Confirm each step, availability and requirements with the school office.",
      String(defaultContent.pages.admissions.stepsSubtitle),
    );
    migrateExactCopy(
      content.pages.facilities as Record<string, unknown>,
      "heading",
      "Space to think, practise and participate",
      String(defaultContent.pages.facilities.heading),
    );
    migrateExactCopy(
      content.pages.facilities as Record<string, unknown>,
      "body",
      "Use this page to explore the learning environment and activities offered by the academy. The images on this first version are illustrative, not photographs verified as belonging to the school. The administration should replace descriptions and imagery with accurate current campus information.",
      String(defaultContent.pages.facilities.body),
    );
    migrateExactCopy(
      content.pages.vision as Record<string, unknown>,
      "body",
      "The statement below is proposed website copy, not a quotation from school leadership. The school can edit it to match its officially adopted vision and mission.",
      String(defaultContent.pages.vision.body),
    );
    migrateExactCopy(
      content.pages.vision as Record<string, unknown>,
      "visionDisclaimer",
      "These statements are proposed website copy, not attributed to school leadership. The school should replace them with its approved vision and mission statements.",
      String(defaultContent.pages.vision.visionDisclaimer),
    );
    migrateExactCopy(
      content.pages.vision as Record<string, unknown>,
      "visionDisclaimer",
      "School management should review and approve these vision and mission statements before treating them as the academy’s official wording.",
      "",
    );
    migrateExactCopy(
      content.seo as unknown as Record<string, unknown>,
      "socialImage",
      "/images/campus-illustration.webp",
      String(defaultContent.seo.socialImage),
    );

    // Existing MongoDB content can predate the new public calendar link.
    if (!content.navigation.some((item) => item.href === "/calendar")) {
      const noticeIndex = content.navigation.findIndex((item) => item.href === "/notices");
      content.navigation.splice(noticeIndex >= 0 ? noticeIndex + 1 : content.navigation.length, 0, { label: "Calendar", href: "/calendar" });
    }
    if (!content.footer.informationLinks.some((item) => item.href === "/calendar")) {
      const noticeIndex = content.footer.informationLinks.findIndex((item) => item.href === "/notices");
      content.footer.informationLinks.splice(noticeIndex >= 0 ? noticeIndex + 1 : content.footer.informationLinks.length, 0, { label: "School Calendar", href: "/calendar" });
    }

    // Avoid advertising a known contradictory unit-test notice after its date has passed;
    // the record remains in the CMS so the school can update or re-publish it deliberately.
    const hideKnownStaleTestNotice = (items: Array<{ title?: string; description?: string; active?: boolean }>) => {
      for (const item of items) {
        const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
        if (item.active && (text.includes("monthly unit tests schedule out") || text.includes("first unit test starts from july 22"))) {
          item.active = false;
        }
      }
    };
    hideKnownStaleTestNotice(content.home.notices);
    const disablePlaceholderNotices = (items: Array<{ id?: string; title?: string; description?: string; active?: boolean }>) => {
      for (const item of items) {
        const title = (item.title || "").trim().toLowerCase();
        if (
          item.id === "welcome-enquiries" || item.id === "school-updates" ||
          title === "contact the school for admission enquiries" ||
          title === "check this page for school announcements" ||
          title === "contact the school for current admission details"
        ) item.active = false;
      }
    };
    disablePlaceholderNotices(content.home.notices as Array<{ id?: string; title?: string; description?: string; active?: boolean }>);
    const noticePageItems = content.pages.notices.notices;
    if (Array.isArray(noticePageItems)) {
      hideKnownStaleTestNotice(noticePageItems as Array<{ title?: string; description?: string; active?: boolean }>);
      disablePlaceholderNotices(noticePageItems as Array<{ id?: string; title?: string; description?: string; active?: boolean }>);
    }

    // Replace generic demo leader cards that were incorrectly presented as attributed messages.
    for (const leader of content.home.leaders) {
      if (leader.name || leader.portrait) continue;
      if (leader.role === "Message from the Director" && leader.message === "A meaningful school experience should strengthen understanding, nurture curiosity and help students practise self-discipline, confidence and respect. We value the partnership between school and family in each learner’s growth.") {
        leader.role = "Learning with purpose";
        leader.designation = "Our approach";
        leader.message = "A meaningful learning experience builds understanding, encourages curiosity and helps students practise responsibility, confidence and respect. Small, consistent steps give learners a foundation for continued growth.";
      }
      if (leader.role === "Message from the Principal" && leader.message === "Every learner benefits from clear guidance, regular practice and encouragement. Through consistent learning habits and communication with families, we aim to help students build understanding and confidence step by step.") {
        leader.role = "School–family partnership";
        leader.designation = "Working together";
        leader.message = "Clear communication helps families stay connected with school life. Questions, feedback and regular conversations can help students build stronger learning habits and move forward with confidence.";
      }
    }

    const calendar = content.pages.calendar;
    const legacyCalendarSubtitle = "A place for dates and events confirmed by the school administration.";
    if (calendar.subtitle === legacyCalendarSubtitle) {
      calendar.subtitle = defaultContent.pages.calendar.subtitle;
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

    // Migrate only exact matches of the prior generic default copy; keep school-authored text.
    const migrateKnownDefault = (target: Record<string, unknown>, key: string, previous: string, next: string) => {
      if (target[key] === previous) target[key] = next;
    };
    migrateKnownDefault(content.pages.about as Record<string, unknown>, "subtitle", "School information for families in New Lepa, Kasrawad and Khargone.", String(defaultContent.pages.about.subtitle));
    migrateKnownDefault(content.pages.about as Record<string, unknown>, "body", "Located in New Lepa, Kasrawad, Khargone, Shri Gurukul Academy is listed as serving Classes 1–10. We believe school should help children build knowledge, confidence, curiosity and respect. Contact the academy for confirmed information about the current academic programme, facilities and admissions.", String(defaultContent.pages.about.body));
    migrateKnownDefault(content.pages.about as Record<string, unknown>, "commitmentBody", "We value purposeful learning, thoughtful communication and the habits that help children grow with confidence. Families are welcome to contact the school with questions about current programmes and admissions.", String(defaultContent.pages.about.commitmentBody));
    migrateKnownDefault(content.pages.academics as Record<string, unknown>, "subtitle", "A learning journey designed around the needs of students at different stages.", String(defaultContent.pages.academics.subtitle));
    migrateKnownDefault(content.pages.academics as Record<string, unknown>, "body", "Shri Gurukul Academy serves Classes 1–10. The learning stages below describe broad priorities at each level; families can contact the school for the current syllabus, subjects, assessment pattern, book list and academic calendar.", String(defaultContent.pages.academics.body));
    migrateKnownDefault(content.pages.academics as Record<string, unknown>, "levelsSubtitle", "Three broad stages describe common learning priorities. Ask the school about the current curriculum and subjects.", String(defaultContent.pages.academics.levelsSubtitle));
    migrateKnownDefault(content.pages.admissions as Record<string, unknown>, "subtitle", "Start with a conversation with the school and learn about class availability, required documents and the next steps.", String(defaultContent.pages.admissions.subtitle));
    migrateKnownDefault(content.pages.admissions as Record<string, unknown>, "body", "Submit an enquiry and the school team can follow up using the contact details you provide. Class availability, fees, eligibility, documents and dates must be confirmed directly with the academy before applying.", String(defaultContent.pages.admissions.body));
    migrateKnownDefault(content.pages.admissions as Record<string, unknown>, "stepsTitle", "Your admission journey, step by step", String(defaultContent.pages.admissions.stepsTitle));
    migrateKnownDefault(content.pages.admissions as Record<string, unknown>, "eligibilityTitle", "Documents & eligibility", String(defaultContent.pages.admissions.eligibilityTitle));
    migrateKnownDefault(content.pages.admissions as Record<string, unknown>, "eligibilityBody", "Required documents and age/class criteria are set by the school. Please request the current official list before visiting or applying.", String(defaultContent.pages.admissions.eligibilityBody));
    migrateKnownDefault(content.pages.admissions as Record<string, unknown>, "eligibilityPoints", "Ask for the current admission form.\nConfirm the class and seat availability.\nCheck the official document and fee list.\nAsk about school timings and next steps.", String(defaultContent.pages.admissions.eligibilityPoints));
    migrateKnownDefault(content.pages.facilities as Record<string, unknown>, "subtitle", "The everyday experiences that help students learn and develop confidence.", String(defaultContent.pages.facilities.subtitle));
    migrateKnownDefault(content.pages.facilities as Record<string, unknown>, "body", "A positive school experience is built through purposeful lessons, regular practice and opportunities to learn with others. The academy’s current facilities and activities should be confirmed by the school office; approved campus photographs can be added here through the website admin panel.", String(defaultContent.pages.facilities.body));
    migrateKnownDefault(content.pages.notices as Record<string, unknown>, "subtitle", "Announcements and updates published by the school administration.", String(defaultContent.pages.notices.subtitle));
    migrateKnownDefault(content.pages.notices as Record<string, unknown>, "body", "Official notices, dates and circulars will appear here when published by the academy. Please confirm time-sensitive information directly with the school office.", String(defaultContent.pages.notices.body));
    migrateKnownDefault(content.pages.contact as Record<string, unknown>, "subtitle", "Reach out for questions about admissions, school information or general enquiries.", String(defaultContent.pages.contact.subtitle));
    migrateKnownDefault(content.pages.contact as Record<string, unknown>, "body", "Use the official school phone number or email below. The enquiry form sends your message to the school website backend and stores it in the database when the service is configured.", String(defaultContent.pages.contact.body));
    migrateKnownDefault(content.pages.disclosure as Record<string, unknown>, "body", "No board affiliation, recognition certificate, fee schedule or statutory claim is asserted on this page. The administration can upload current approved documents and enter their descriptions through the website CMS.", String(defaultContent.pages.disclosure.body));
    migrateKnownDefault(content.pages.calendar as Record<string, unknown>, "body", "School-approved events, holidays and examination dates are published here when confirmed by the academy. Contact the school office to verify urgent schedule changes.", String(defaultContent.pages.calendar.body));
    migrateKnownDefault(content.pages.facilities as Record<string, unknown>, "imageDisclaimer", "The academy’s official photographs and current facility details should be maintained by the school office so families can see an accurate picture of campus life.", String(defaultContent.pages.facilities.imageDisclaimer));
    migrateKnownDefault(content.pages.gallery as Record<string, unknown>, "galleryDisclaimer", "The images currently shown are illustrative design images, not official photographs of Shri Gurukul Academy. Upload approved campus and activity photographs before presenting this page as the academy’s photo gallery.", String(defaultContent.pages.gallery.galleryDisclaimer));
    migrateKnownDefault(content.pages.schoolLife as Record<string, unknown>, "schoolLifeDisclaimer", "The gallery should be updated with academy-approved photographs and captions so families can explore genuine school activities and events.", String(defaultContent.pages.schoolLife.schoolLifeDisclaimer));
    migrateKnownDefault(content.pages.privacy as Record<string, unknown>, "body", "The website may collect the details you submit through contact and admission enquiry forms, such as a parent or guardian name, phone number, email address, student's class of interest and your message. The information is intended to help the school respond to your enquiry. Do not submit sensitive personal documents through a general enquiry form. Configure hosting, database retention and email providers according to applicable privacy obligations before public launch.", String(defaultContent.pages.privacy.body));
    migrateKnownDefault(content.pages.vision as Record<string, unknown>, "visionDisclaimer", "School management should review and approve these vision and mission statements before treating them as the academy’s official wording.", "");
    migrateKnownDefault(content.pages.privacy as Record<string, unknown>, "privacyImplementationNote", "This is a starter privacy notice, not legal advice. The school must verify it against its actual data handling, retention practices, technology providers and applicable law.", "");
    migrateKnownDefault(content.pages.privacy as Record<string, unknown>, "privacySectionsSubtitle", "Review this policy with the school and hosting providers before launching publicly.", String(defaultContent.pages.privacy.privacySectionsSubtitle));
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

    // Remove the generic demo row from the CMS entirely; draft records from the
    // school remain editable even when their dates/details are incomplete.
    const allCalendarEntries = content.pages.calendar.calendarEntries as Array<{ title?: string; description?: string; date?: string; active?: boolean }>;
    content.pages.calendar.calendarEntries = allCalendarEntries.filter((entry) => {
      const title = (entry.title || "").trim().toLowerCase();
      const description = (entry.description || "").trim().toLowerCase();
      return title !== "new calendar update" && description !== "add school-approved details and dates.";
    });
    for (const entry of content.pages.calendar.calendarEntries as Array<{ title?: string; description?: string; date?: string; active?: boolean }>) {
      if (!entry.title?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date || "")) entry.active = false;
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


    // Upgrade only fields that still exactly match the previous shipped defaults.
    // If an administrator has edited a field, its custom copy is preserved.
    const readPath = (source: unknown, path: string[]) => path.reduce<unknown>((value, key) => {
      if (!value || typeof value !== "object") return undefined;
      return (value as Record<string, unknown>)[key];
    }, source);
    const writePath = (target: unknown, path: string[], value: unknown) => {
      if (!target || typeof target !== "object" || path.length === 0) return;
      let cursor = target as Record<string, unknown>;
      for (const key of path.slice(0, -1)) {
        const next = cursor[key];
        if (!next || typeof next !== "object" || Array.isArray(next)) return;
        cursor = next as Record<string, unknown>;
      }
      cursor[path[path.length - 1]] = structuredClone(value);
    };
    for (const migration of copyMigrations as Array<{ path: string[]; previous: unknown }>) {
      const existingValue = readPath(content, migration.path);
      const defaultValue = readPath(defaultContent, migration.path);
      if (JSON.stringify(existingValue) === JSON.stringify(migration.previous)) {
        writePath(content, migration.path, defaultValue);
      }
    }

    return normalizeLegacyRoutes(content);
  } catch (error) {
    console.error("Could not load CMS content; using safe defaults.", error instanceof Error ? error.message : "Unknown error");
    return sanitizeContent(structuredClone(defaultContent));
  }
});
