import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { PageIntro } from "@/components/page-intro";
import { PageSectionList } from "@/components/page-section-list";
import { SectionHeading } from "@/components/section-heading";
import { getSiteContent } from "@/lib/content";
import { Icon, type IconName } from "@/components/icon";
export async function generateMetadata() { return pageMetadata("academics"); }
export default async function AcademicsPage() {
  const { pages } = await getSiteContent(); const page = pages.academics;
  return <><PageHero title={page.title} subtitle={page.subtitle}/><section className="calendar-promo"><div className="wrap calendar-promo-inner"><div className="calendar-promo-icon"><Icon name="calendar-days" size={30}/></div><div><span className="eyebrow">{String(page.calendarEyebrow || "PLANNING & PREPARATION")}</span><h2>{String(page.calendarTitle || "Academic dates and learning expectations")}</h2><p>{String(page.calendarDescription || "Contact the school for the latest calendar, curriculum information, assessment schedule and book list.")}</p></div><a className="button button-primary" href="/calendar">{String(page.calendarButtonLabel || "View Calendar")} <Icon name="arrow-up-right" size={15}/></a></div></section><PageIntro page={page}/><section className="section-pad section-soft"><div className="wrap"><SectionHeading eyebrow={String(page.levelsEyebrow || "LEARNING JOURNEY")} title={String(page.levelsTitle || "Classes & learning stages")} subtitle={String(page.levelsSubtitle || "Three broad stages describe common learning priorities. Ask the school about the current curriculum and subjects.")}/><div className="academic-levels">{(page.levels || []).map((level, i) => <article className="academic-level" key={level.range}><span className="level-icon"><Icon name={(["book-open", "monitor", "graduation-cap"] as IconName[])[i % 3]} size={24}/></span><span className="level-range">{level.range}</span><h3>{level.title}</h3><p>{level.description}</p></article>)}</div></div></section><PageSectionList sections={page.sections || []} title={String(page.learningTitle || "Our learning approach")} subtitle={String(page.learningSubtitle || "An effective learning routine is built through regular effort and feedback.")} variant="plain"/></>;
}
