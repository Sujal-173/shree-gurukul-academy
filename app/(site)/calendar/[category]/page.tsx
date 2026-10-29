import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { CalendarEntryList } from "@/components/calendar-entry-list";
import type { CalendarEntry } from "@/lib/types";
import { getSiteContent } from "@/lib/content";
import { calendarCategories, calendarCategoryKey, isPublicCalendarEntry, sortCalendarEntries, type CalendarCategoryKey } from "@/lib/calendar";
import { pageMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import { Icon } from "@/components/icon";
import { CalendarResourceList } from "@/components/calendar-resource-list";

export function generateStaticParams() { return Object.keys(calendarCategories).map((category) => ({ category })); }

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const config = calendarCategories[category as CalendarCategoryKey];
  if (!config) return { title: "Calendar | Shri Gurukul Academy" };
  const base = await pageMetadata("calendar");
  const siteUrl = getSiteUrl();
  const canonical = siteUrl ? new URL(`/calendar/${category}`, siteUrl).toString() : undefined;
  return {
    ...base,
    title: `${config.label} | Shri Gurukul Academy New Lepa`,
    description: config.description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      ...base.openGraph,
      title: `${config.label} | Shri Gurukul Academy New Lepa`,
      description: config.description,
      ...(canonical ? { url: canonical } : {}),
    },
    twitter: {
      ...base.twitter,
      title: `${config.label} | Shri Gurukul Academy New Lepa`,
      description: config.description,
    },
  };
}

export default async function CalendarCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const config = calendarCategories[category as CalendarCategoryKey];
  if (!config) notFound();
  const content = await getSiteContent();
  const allEntries = ((content.pages.calendar.calendarEntries || []) as CalendarEntry[]).filter(isPublicCalendarEntry);
  const entries = sortCalendarEntries(allEntries.filter((item) => calendarCategoryKey(item.category) === category));
  const resources = Array.isArray(content.pages.calendar.calendarResources) ? content.pages.calendar.calendarResources as import("@/lib/types").CalendarResource[] : [];
  const navItems = [
    { key: "events", label: "Events & celebrations", icon: "sparkles" as const, href: "/calendar/events" },
    { key: "holidays", label: "Holidays", icon: "sun" as const, href: "/calendar/holidays" },
    { key: "exams", label: "Examinations", icon: "book-open" as const, href: "/calendar/exams" },
  ];

  return (
    <>
      <PageHero title={config.label} subtitle={config.description} path={`/calendar/${category}`} />
      <section className="section-pad calendar-page-section">
        <div className="wrap calendar-category-wrap">
          <nav className="calendar-category-nav" aria-label="Calendar categories">
            <Link href="/calendar"><Icon name="calendar-days" size={16}/> All updates</Link>
            {navItems.map((item) => (
              <Link key={item.key} className={item.key === category ? "is-active" : ""} aria-current={item.key === category ? "page" : undefined} href={item.href}><Icon name={item.icon} size={16}/>{item.label}</Link>
            ))}
          </nav>
          <section className="calendar-entry-section calendar-category-entries" aria-labelledby="calendar-updates-heading">
            <div className="calendar-entry-section-heading">
              <span className="eyebrow">OFFICIAL SCHOOL UPDATES</span>
              <h2 id="calendar-updates-heading">{config.label}</h2>
              <p>{config.description} Only records published by the school administration appear here.</p>
            </div>
            <CalendarEntryList
              entries={entries}
              emptyText={`There are no published ${config.label.toLowerCase()} at the moment. Confirm urgent or time-sensitive dates with the school office.`}
            />
          </section>
          {category === "exams" && <CalendarResourceList resources={resources} kind="exam-timetable" title="Published exam timetables" subtitle="Download the timetable for the class or grade shown in each record." />}
          <p className="calendar-administration-note"><Icon name="bell" size={16}/><span>For a change to an announced date, please verify the latest information with the school office.</span></p>
        </div>
      </section>
    </>
  );
}
