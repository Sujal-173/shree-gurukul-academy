import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";
import { getSiteUrl } from "@/lib/site-url";

const pageDescriptions: Record<string, (schoolName: string) => string> = {
  home: (name) =>
    `${name} serves Classes 1–10 in New Lepa, Kasrawad, Khargone, Madhya Pradesh. Find school information and contact the academy about admissions.`,
  about: (name) =>
    `Learn about ${name}, a school in New Lepa, Kasrawad, Khargone, serving Classes 1–10. Contact the academy for current school information.`,
  academics: (name) =>
    `Explore class and learning information for Classes 1–10 at ${name} in New Lepa, Khargone. Contact the school for current curriculum and schedules.`,
  admissions: (name) =>
    `Ask ${name} in New Lepa, Kasrawad about current admission availability, class requirements, fees and documents for Classes 1–10.`,
  admission: (name) =>
    `Ask ${name} in New Lepa, Kasrawad about current admission availability, class requirements, fees and documents for Classes 1–10.`,
  facilities: (name) =>
    `Find school information for ${name} in New Lepa, Khargone. Contact the academy to confirm currently available facilities and activities.`,
  notices: (name) =>
    `Read current school announcements and updates from ${name} in New Lepa, Kasrawad, Khargone.`,
  gallery: (name) =>
    `Browse published school photographs and updates from ${name} in New Lepa, Khargone, Madhya Pradesh.`,
  vision: (name) =>
    `Read about the learning values and educational approach presented by ${name} in New Lepa, Khargone.`,
  contact: (name) =>
    `Contact ${name} in New Lepa, Kasrawad, Khargone by phone or email for school and admission enquiries.`,
  disclosure: (name) =>
    `View official school information and documents published by ${name} in New Lepa, Khargone.`,
  calendar: (name) =>
    `Check school calendar and planner updates published by ${name} in New Lepa, Khargone, Madhya Pradesh.`,
  schoolLife: (name) =>
    `Explore school-life updates published by ${name} in New Lepa, Khargone. Contact the school to confirm current activities.`,
  privacy: (name) =>
    `Read the privacy information for enquiries submitted to ${name} in New Lepa, Khargone.`,
};

export async function pageMetadata(slug: string): Promise<Metadata> {
  const content = await getSiteContent();
  const page = content.pages[slug] ?? (slug === "admission" ? content.pages.admissions : undefined);
  const pageTitle = page?.title || content.seo.title;
  const title =
    slug === "home"
      ? pageTitle
      : `${pageTitle} | ${content.brand.shortName} New Lepa`;
  const description =
    pageDescriptions[slug]?.(content.brand.name) ||
    page?.subtitle ||
    content.seo.description;
  const siteUrl = getSiteUrl();
  const routeMap: Record<string, string> = {
    home: "",
    schoolLife: "school-life",
  };
  const path = routeMap[slug] ?? slug;
  const canonical = siteUrl
    ? new URL(path ? `/${path}` : "/", siteUrl).toString()
    : undefined;
  return {
    title,
    description,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title,
      description,
      ...(canonical ? { url: canonical } : {}),
      siteName: content.brand.name,
      locale: "en_IN",
      type: "website",
    },
  };
}
