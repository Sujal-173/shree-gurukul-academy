import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { CalendarEntryList } from "@/components/calendar-entry-list";
import { CalendarResourceList } from "@/components/calendar-resource-list";
import type { CalendarEntry } from "@/lib/types";
import { getSiteContent } from "@/lib/content";
import { isPublicCalendarEntry, sortCalendarEntries } from "@/lib/calendar";
import { Icon } from "@/components/icon";
import { PageFaqs } from "@/components/page-faqs";

export async function generateMetadata() { return pageMetadata("calendar"); }

export default async function CalendarPage() {
  const content = await getSiteContent();
  const page = content.pages.calendar;
  const entries = sortCalendarEntries(((page.calendarEntries || []) as CalendarEntry[]).filter(isPublicCalendarEntry));
  const resources = Array.isArray(page.calendarResources) ? page.calendarResources as import("@/lib/types").CalendarResource[] : [];
  const categoryShortcuts = [
    { key: "events", label: "Events & Celebrations", icon: "sparkles" as const, description: "School functions, celebrations and activity dates." },
    { key: "holidays", label: "Holidays", icon: "sun" as const, description: "Confirmed school holidays and vacation periods." },
    { key: "exams", label: "Examinations", icon: "book-open" as const, description: "Exam dates, class details and assessment schedules." },
  ];

  return (
    <>
      <PageHero title={page.title} subtitle={page.subtitle} path="/calendar" />
      <section className="section-pad calendar-page-section">
        <div className="wrap calendar-main">
          <nav className="calendar-category-nav" aria-label="Calendar categories">
            <Link className="is-active" aria-current="page" href="/calendar"><Icon name="calendar-days" size={16}/> All updates</Link>
            <Link href="/calendar/events"><Icon name="sparkles" size={16}/> Events & celebrations</Link>
            <Link href="/calendar/holidays"><Icon name="sun" size={16}/> Holidays</Link>
            <Link href="/calendar/exams"><Icon name="book-open" size={16}/> Examinations</Link>
          </nav>

          <section className="calendar-entry-section calendar-overview-entries" aria-labelledby="calendar-all-updates-heading">
            <div className="calendar-entry-section-heading">
              <span className="eyebrow">DATES & ANNOUNCEMENTS</span>
              <h2 id="calendar-all-updates-heading">School dates and updates</h2>
              <p>Browse confirmed school events, holidays and exam dates. Choose a category above to find the information you need.</p>
            </div>
            <CalendarEntryList
              entries={entries}
              showCategory
              emptyText="There are no confirmed dates published right now. Check back for school-approved updates, or call the office if you need to confirm a date."
            />
          </section>

          <CalendarResourceList resources={resources} title="School calendar and timetables" subtitle="Open the latest school-approved calendar and examination timetable shared by the office." />

          <p className="calendar-administration-note"><Icon name="bell" size={16}/><span>We update this calendar when the academy confirms a date. If a change affects travel or an exam, please call the school office to check the latest details.</span></p>
          <div className="calendar-category-shortcuts" aria-label="Browse calendar by category">
            {categoryShortcuts.map((category) => (
              <Link href={`/calendar/${category.key}`} key={category.key} className="calendar-category-shortcut">
                <span className="calendar-category-shortcut-icon"><Icon name={category.icon} size={18}/></span>
                <span><strong>{category.label}</strong><small>{category.description}</small></span>
                <Icon name="arrow-up-right" size={16}/>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <PageFaqs faqs={page.faqs || []} title="Calendar questions" subtitle="Use the category links above for the type of date you need."/>
    </>
  );
}
