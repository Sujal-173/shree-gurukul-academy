import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { PageIntro } from "@/components/page-intro";
import { PageSectionList } from "@/components/page-section-list";
import { getSiteContent } from "@/lib/content";
export async function generateMetadata() { return pageMetadata("about"); }
export default async function AboutPage() {
  const { pages } = await getSiteContent(); const page = pages.about;
  return <><PageHero title={page.title} subtitle={page.subtitle}/><PageIntro page={page}/><PageSectionList sections={page.sections || []} title={String(page.sectionTitle || "What matters in a school journey")} subtitle={String(page.sectionSubtitle || "The principles that guide a supportive learning experience.")}/><section className="section-pad"><div className="wrap two-card-highlight"><div><span className="eyebrow">{String(page.commitmentEyebrow || "OUR COMMITMENT")}</span><h2>{String(page.commitmentTitle || "Good foundations make room for growth.")}</h2><p>{String(page.commitmentBody || "Families should be able to access clear school information, ask questions and get guidance directly from the academy.")}</p></div><div className="commitment-list">{String(page.commitmentPoints || "Clear communication\nRespect for every learner\nSteady learning habits").split(/\r?\n/).filter(Boolean).map((point, index) => <p key={`${point}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span> {point}</p>)}</div></div></section></>;
}
