import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { CalendarPlannerExplorer } from "@/components/calendar-planner-explorer";
import { getSiteContent } from "@/lib/content";
import { Icon } from "@/components/icon";
export async function generateMetadata() { return pageMetadata("calendar"); }
export default async function CalendarPage() {
  const content = await getSiteContent();
  const page = content.pages.calendar;
  return (
    <>
      <PageHero title={page.title} subtitle={page.subtitle}/>
      <section className="section-pad calendar-planner-section">
        <div className="wrap calendar-main">
          <div className="calendar-planner-layout">
            <div className="calendar-session-badge " aria-label={`Session: ${String(page.calendarSession || "School year")}`}>
              <Icon name="calendar-days" size={22}/>
              <strong>{String('Academic session calender')}</strong>
            </div>
            <article className="calendar-planner-card">
              <div className="calendar-planner-heading">
                <span className="calendar-planner-eyebrow">{String(page.calendarBlockEyebrow || "OFFICIAL PLANNER")}</span>
                <h2>{String(page.calendarBlockTitle || "School Academic Calendar & Planners")}</h2>
                <p>{String(page.calendarBlockDescription || "The school administration publishes confirmed calendars, holidays, examinations and activity schedules here.")}</p>
              </div>
              <CalendarPlannerExplorer
                items={page.calendarPlanners || []}
                emptyText={String(page.calendarEmptyText || "No official planners have been published yet. Please contact the school office for the current schedule.")}
              />
              <div className="calendar-planner-meta">
                <span><Icon name="user-round" size={15}/>{String(page.calendarPostedBy || "School Office")}</span>
                <span><Icon name="clock" size={15}/>Posted: {String(page.calendarSession || "Current session")}</span>
              </div>
            </article>
          </div>
          {content.home.notices.some((item) => item.active && item.date) && (
            <div className="calendar-date-note">
              <Icon name="bell" size={16}/>
              <span>Dated school announcements are also available on the <a href="/notices">Notice Board</a>.</span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
