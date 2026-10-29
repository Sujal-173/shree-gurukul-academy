import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";
import { getSiteUrl } from "@/lib/site-url";

const pageTitles: Record<string, string> = {
  about: "About the Academy",
  academics: "Academics & Classes 1–10",
  admission: "Admission Enquiry",
  facilities: "Learning Environment",
  notices: "School Notices",
  gallery: "Photo Gallery",
  vision: "Vision, Mission & Values",
  contact: "Contact Details",
  disclosure: "School Information",
  calendar: "School Calendar",
  schoolLife: "School Life",
  privacy: "Privacy Policy",
};

const pageDescriptions: Record<string, (schoolName: string) => string> = {
  home: (name) => `${name} is based in New Lepa, Kasrawad, Khargone, Madhya Pradesh. Find information for Classes 1–10, academics, admission enquiries and confirmed school updates.`,
  about: (name) => `Learn about ${name} in New Lepa, Kasrawad, Khargone, and find useful information for families considering the school.`,
  academics: (name) => `Explore learning stages for Classes 1–10 at ${name} in New Lepa, Kasrawad. Contact the school for the current syllabus, subjects, book list and assessment details.`,
  admission: (name) => `Enquire about admission at ${name} in New Lepa, Kasrawad, Khargone. Ask about class availability, fees, documents and the current process.`,
  facilities: (name) => `Read about the learning environment at ${name} in New Lepa. Contact the school to confirm current facilities and activities.`,
  notices: (name) => `Find confirmed school notices, circulars and important updates from ${name} in New Lepa, Kasrawad, Khargone.`,
  gallery: (name) => `View academy-approved photographs and school-life updates from ${name} in New Lepa, Khargone, Madhya Pradesh.`,
  vision: (name) => `Read the learning values and educational approach presented by ${name} in New Lepa, Kasrawad, Khargone.`,
  contact: (name) => `Contact ${name} in New Lepa, Kasrawad, Khargone, by phone, email or the school enquiry form.`,
  disclosure: (name) => `Find school records and documents published by ${name} in New Lepa, Khargone, when approved for public access.`,
  calendar: (name) => `Check confirmed events, holidays and examination dates published by ${name} in New Lepa, Khargone, Madhya Pradesh.`,
  schoolLife: (name) => `Explore school-life updates and approved activity photographs from ${name} in New Lepa, Khargone.`,
  privacy: (name) => `Learn how the ${name} website handles contact and admission enquiry information.`,
};

const pageKeywords: Record<string, string[]> = {
  home: ["Shri Gurukul Academy New Lepa", "school in New Lepa", "school in Kasrawad", "school in Khargone", "Classes 1–10"],
  about: ["Shri Gurukul Academy New Lepa", "about the academy", "school in New Lepa Kasrawad"],
  academics: ["Classes 1–10", "school academics New Lepa", "school in Kasrawad Khargone"],
  admission: ["Shri Gurukul Academy admission", "school admission New Lepa", "admission enquiry Kasrawad", "admission Classes 1–10"],
  facilities: ["school learning environment New Lepa", "Shri Gurukul Academy facilities"],
  notices: ["school notices New Lepa", "school circulars Kasrawad", "Shri Gurukul Academy announcements"],
  gallery: ["Shri Gurukul Academy photo gallery", "school life New Lepa"],
  vision: ["Shri Gurukul Academy values", "school mission New Lepa"],
  contact: ["Shri Gurukul Academy contact", "school contact New Lepa", "school in Kasrawad phone"],
  disclosure: ["Shri Gurukul Academy school documents", "school information Khargone"],
  calendar: ["school calendar New Lepa", "school holidays Khargone", "school exam dates Kasrawad"],
  schoolLife: ["school activities New Lepa", "school life Kasrawad", "Shri Gurukul Academy activities"],
  privacy: ["Shri Gurukul Academy privacy policy"],
};

const routeMap: Record<string, string> = { home: "", admission: "admission", schoolLife: "school-life" };
const socialImageUrl = (value: string | undefined, siteUrl: URL | undefined) => {
  if (!value) return siteUrl ? new URL("/images/og-academy.webp", siteUrl).toString() : undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return siteUrl ? new URL(value.startsWith("/") ? value : `/${value}`, siteUrl).toString() : undefined;
};

export async function pageMetadata(slug: string): Promise<Metadata> {
  const content = await getSiteContent();
  const page = slug === "admission" ? content.pages.admissions : slug === "home" ? undefined : content.pages[slug];
  const siteUrl = getSiteUrl();
  const isHome = slug === "home";
  const configuredTitle = content.seo.title?.trim() || `${content.brand.name} New Lepa | Classes 1–10`;
  const descriptiveTitle = pageTitles[slug] || page?.title || content.brand.shortName;
  const title = isHome ? configuredTitle : `${descriptiveTitle} | ${content.brand.name} New Lepa`;
  const description = (pageDescriptions[slug]?.(content.brand.name) || page?.subtitle || content.seo.description || content.brand.tagline).slice(0, 160);
  const path = routeMap[slug] ?? slug;
  const canonical = siteUrl ? new URL(path ? `/${path}` : "/", siteUrl).toString() : undefined;
  const image = socialImageUrl(content.seo.socialImage, siteUrl);
  const baseKeywords = Array.isArray(content.seo.keywords) ? content.seo.keywords.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
  const keywords = [...new Set([...baseKeywords, ...(pageKeywords[slug] || [])])].slice(0, 16);

  return {
    title,
    description,
    keywords,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title, description, siteName: content.brand.name, locale: "en_IN", type: "website",
      ...(canonical ? { url: canonical } : {}),
      ...(image ? { images: [{ url: image, alt: `${content.brand.name} New Lepa website preview image` }] } : {}),
    },
    twitter: {
      card: "summary_large_image", title, description,
      ...(image ? { images: [{ url: image, alt: `${content.brand.name} New Lepa website preview image` }] } : {}),
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}
