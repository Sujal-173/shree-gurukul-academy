import type { IconName } from "@/components/icon";

export type CmsPageDefinition = {
  slug: string;
  key: string;
  label: string;
  description: string;
  publicPath: string;
  icon: IconName;
  group: "Main pages" | "Information pages" | "Settings";
};

export const cmsPageDefinitions: CmsPageDefinition[] = [
  { slug: "home", key: "home", label: "Homepage", description: "Hero slides, introduction, highlights, values, leadership messages, statistics and calls to action.", publicPath: "/", icon: "home", group: "Main pages" },
  { slug: "about", key: "about", label: "About", description: "School introduction, overview image, commitments, milestones and about sections.", publicPath: "/about", icon: "building", group: "Main pages" },
  { slug: "academics", key: "academics", label: "Academics", description: "Class levels, curriculum messaging, academic approach and learning sections.", publicPath: "/academics", icon: "book-open", group: "Main pages" },
  { slug: "admission", key: "admissions", label: "Admissions", description: "Admission instructions, steps, FAQs and enquiry content.", publicPath: "/admission", icon: "graduation-cap", group: "Main pages" },
  { slug: "facilities", key: "facilities", label: "Facilities", description: "Campus introduction, facility cards, image descriptions and facility details.", publicPath: "/facilities", icon: "library", group: "Main pages" },
  { slug: "school-life", key: "schoolLife", label: "School Life", description: "Activities, celebrations, sports, student participation and gallery sections.", publicPath: "/school-life", icon: "users", group: "Main pages" },
  { slug: "gallery", key: "gallery", label: "Gallery", description: "Gallery introduction, disclaimer and individually managed image cards.", publicPath: "/gallery", icon: "images", group: "Main pages" },
  { slug: "vision", key: "vision", label: "Vision & Values", description: "Vision, mission, values and the academy’s approved statements.", publicPath: "/vision", icon: "eye", group: "Information pages" },
  { slug: "notices", key: "notices", label: "Notices", description: "Notice board title, instructions and published announcements.", publicPath: "/notices", icon: "bell", group: "Information pages" },
  { slug: "calendar", key: "calendar", label: "Calendar", description: "Manage event, holiday and examination records with category-specific fields and publication controls.", publicPath: "/calendar", icon: "calendar-days", group: "Information pages" },
  { slug: "contact", key: "contact", label: "Contact", description: "Contact page copy, contact cards, map labels and enquiry form text.", publicPath: "/contact", icon: "mail", group: "Information pages" },
  { slug: "disclosure", key: "disclosure", label: "Disclosure", description: "Published school documents, disclosure descriptions and document links.", publicPath: "/disclosure", icon: "file-check", group: "Information pages" },
  { slug: "privacy", key: "privacy", label: "Privacy Policy", description: "Privacy notice and data-handling information shown to website visitors.", publicPath: "/privacy", icon: "shield-check", group: "Information pages" },
  { slug: "site-settings", key: "site-settings", label: "Site settings", description: "School contact details, crest, navigation, footer, SEO and social previews.", publicPath: "/", icon: "settings", group: "Settings" },
];

export function getCmsPage(slug: string) {
  return cmsPageDefinitions.find((item) => item.slug === slug) ?? null;
}
