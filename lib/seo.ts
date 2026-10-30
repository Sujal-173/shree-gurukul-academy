import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";
import { getSiteUrl } from "@/lib/site-url";

const pageTitles: Record<string, string> = {
  about: "About Shri Gurukul Academy",
  academics: "Academics & Classes 1–10",
  admission: "Admission Enquiry",
  facilities: "School Facilities",
  notices: "School Notices & Circulars",
  gallery: "School Photo Gallery",
  vision: "Vision, Mission & Values",
  contact: "Contact Shri Gurukul Academy",
  disclosure: "School Information & Disclosure",
  calendar: "School Calendar",
  schoolLife: "School Life & Activities",
  privacy: "Privacy Policy",
};

const pageDescriptions: Record<string, (schoolName: string) => string> = {
  home: () => `Find Classes 1–10, academic information, admission enquiries and school updates from Shri Gurukul Academy in Kasrawad, Khargone.`,
  about: (name) => `Get to know ${name} in New Lepa, Kasrawad, Khargone, and find practical information for families considering the school.`,
  academics: () => `Explore the learning stages listed for Classes 1–10 and find out how to request the current syllabus, subjects, book list and timetable.`,
  admission: (name) => `Ask about admission at ${name} in Kasrawad. Confirm current class availability, eligibility, fees and required documents with the school.`,
  facilities: (name) => `Ask about current classrooms, learning resources, activities and student arrangements at ${name} in New Lepa.`,
  notices: (name) => `Read school-approved notices, circulars and reminders from ${name} in New Lepa, Kasrawad, Khargone.`,
  gallery: (name) => `See academy-approved photographs and captions from ${name} in New Lepa, Khargone, Madhya Pradesh.`,
  vision: (name) => `Read the educational approach and values proposed for ${name} in New Lepa, Kasrawad, Khargone.`,
  contact: (name) => `Call, email or send an enquiry to ${name}, located in New Lepa, Kasrawad, Khargone, Madhya Pradesh 451228.`,
  disclosure: (name) => `Find public school information and documents approved for release by ${name} in New Lepa, Khargone.`,
  calendar: (name) => `Find published school events, holidays and examination updates from ${name} in New Lepa, Kasrawad, Khargone.`,
  schoolLife: (name) => `Find approved school-life updates and photographs from ${name} in Kasrawad, Khargone.`,
  privacy: (name) => `Read how the ${name} website handles information submitted through its contact and admission enquiry forms.`,
};

const pageKeywords: Record<string, string[]> = {
  home: ["Shri Gurukul Academy New Lepa", "school in New Lepa", "school in Kasrawad", "school in Khargone"],
  about: ["Shri Gurukul Academy New Lepa", "about the academy", "school in New Lepa Kasrawad"],
  academics: ["Classes 1–10 New Lepa", "school academics Kasrawad", "school in Khargone"],
  admission: ["school admission in Kasrawad", "admission enquiry New Lepa", "Shri Gurukul Academy admission"],
  facilities: ["school facilities New Lepa", "Shri Gurukul Academy facilities"],
  notices: ["Shri Gurukul Academy notices", "school circulars New Lepa", "school updates Kasrawad"],
  gallery: ["Shri Gurukul Academy photos", "school photo gallery New Lepa"],
  vision: ["Shri Gurukul Academy vision", "school values New Lepa"],
  contact: ["Shri Gurukul Academy contact", "school contact Kasrawad", "school in New Lepa address"],
  disclosure: ["Shri Gurukul Academy school documents", "school information Khargone"],
  calendar: ["school calendar New Lepa", "school holidays Kasrawad", "school exam timetable Khargone"],
  schoolLife: ["Shri Gurukul Academy school life", "school activities New Lepa"],
  privacy: ["Shri Gurukul Academy privacy policy"],
};

const routeMap: Record<string, string> = { home: "", admission: "admission", schoolLife: "school-life" };

function socialImageUrl(value: string | undefined, siteUrl: URL | undefined) {
  if (!value) return siteUrl ? new URL("/images/og-academy.webp", siteUrl).toString() : undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return siteUrl ? new URL(value.startsWith("/") ? value : `/${value}`, siteUrl).toString() : undefined;
}

export async function pageMetadata(slug: string): Promise<Metadata> {
  const content = await getSiteContent();
  const page = slug === "admission" ? content.pages.admissions : slug === "home" ? undefined : content.pages[slug];
  const siteUrl = getSiteUrl();
  const isHome = slug === "home";
  const title = isHome
    ? "Shri Gurukul Academy New Lepa | School in Kasrawad"
    : `${pageTitles[slug] || page?.title || content.brand.shortName} | ${content.brand.name}`;
  const description = (pageDescriptions[slug]?.(content.brand.name) || page?.subtitle || content.seo.description || content.brand.tagline).slice(0, 160);
  const path = routeMap[slug] ?? slug;
  const canonical = siteUrl ? new URL(path ? `/${path}` : "/", siteUrl).toString() : undefined;
  const image = socialImageUrl(content.seo.socialImage, siteUrl);
  const baseKeywords = Array.isArray(content.seo.keywords) ? content.seo.keywords.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
  const keywords = [...new Set([...baseKeywords, ...(pageKeywords[slug] || [])])].slice(0, 12);

  return {
    title,
    description,
    keywords,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title, description, siteName: content.brand.name, locale: "en_IN", type: "website",
      ...(canonical ? { url: canonical } : {}),
      ...(image ? { images: [{ url: image, alt: `${content.brand.name} website preview` }] } : {}),
    },
    twitter: {
      card: "summary_large_image", title, description,
      ...(image ? { images: [{ url: image, alt: `${content.brand.name} website preview` }] } : {}),
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}
