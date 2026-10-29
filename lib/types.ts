export type HeroSlide = {
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle: string;
  image: string;
  alt: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export type ContentSection = {
  eyebrow?: string;
  title: string;
  description: string;
  image?: string;
  alt?: string;
  tag?: string;
  href?: string;
  items?: string[];
};

export type NoticeItem = {
  id: string;
  category: string;
  title: string;
  date: string;
  description: string;
  /** Optional image poster displayed with the notice. */
  imageUrl?: string;
  imageAlt?: string;
  /** Optional uploaded circular or PDF link. */
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  active: boolean;
};

export type CalendarEntry = {
  id?: string;
  category: string;
  title: string;
  date: string;
  endDate?: string;
  time?: string;
  location?: string;
  className?: string;
  subject?: string;
  description?: string;
  /** Supporting poster or circular (image or PDF). */
  documentUrl?: string;
  documentName?: string;
  documentType?: string;
  active: boolean;
};

export type CalendarResource = {
  id: string;
  kind: "school-calendar" | "exam-timetable";
  title: string;
  description: string;
  className?: string;
  academicYear?: string;
  documentUrl: string;
  documentName?: string;
  documentType?: string;
  updatedAt?: string;
  active: boolean;
};

export type CalendarPlanner = {
  category: string;
  title: string;
  image: string;
  alt?: string;
  active: boolean;
};

export type FAQ = { question: string; answer: string };
export type ProcessStep = { number: string; title: string; description: string };
export type AcademicLevel = { range: string; title: string; description: string };
export type SchoolDocument = { title: string; description: string; url: string; updatedAt: string };
export type LeaderProfile = { role: string; name: string; designation: string; message: string; portrait: string; alt: string };

export type PageCopy = {
  title: string;
  subtitle: string;
  heading: string;
  body: string;
  image?: string;
  imageAlt?: string;
  privacyImplementationNote?: string;
  visionDisclaimer?: string;
  sections?: ContentSection[];
  faqs?: FAQ[];
  steps?: ProcessStep[];
  levels?: AcademicLevel[];
  notices?: NoticeItem[];
  documents?: SchoolDocument[];
  [key: string]: unknown;
};

export type SiteContent = {
  navigation: { label: string; href: string }[];
  footer: { description: string; quickLinksTitle: string; informationLinksTitle: string; contactTitle: string; quickLinks: { label: string; href: string }[]; informationLinks: { label: string; href: string }[] };
  brand: {
    name: string;
    shortName: string;
    subtitle: string;
    tagline: string;
    gradeRange: string;
    phone: string;
    email: string;
    whatsapp: string;
    address: string;
    instagram: string;
    logoUrl: string;
    mapQuery: string;
    enquiryLabel: string;
    enquiryHref: string;
  };
  home: {
    hero: HeroSlide[];
    quickLinks: { label: string; description: string; href: string; icon: string }[];
    heroCaptionTitle: string;
    heroCaptionSubtitle: string;
    heroLocationLabel: string;
    introEyebrow: string;
    introTitle: string;
    introBody: string;
    introPoints: string;
    introButtonLabel: string;
    introButtonHref: string;
    introImage: string;
    introAlt: string;
    highlightsEyebrow: string;
    highlightsTitle: string;
    highlightsSubtitle: string;
    highlights: ContentSection[];
    valuesEyebrow: string;
    valuesTitle: string;
    valuesSubtitle: string;
    values: ContentSection[];
    stats: { value: string; label: string }[];
    leadersEyebrow: string;
    leadersTitle: string;
    leadersSubtitle: string;
    leaders: LeaderProfile[];
    noticesEyebrow: string;
    noticesTitle: string;
    noticesSubtitle: string;
    notices: NoticeItem[];
    ctaEyebrow: string;
    ctaTitle: string;
    ctaBody: string;
    ctaLabel: string;
    ctaSecondaryLabel: string;
    ctaSecondaryHref: string;
  };
  pages: Record<string, PageCopy>;
  seo: { title: string; description: string; keywords: string[]; socialImage: string };
};
