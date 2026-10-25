import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { PageIntro } from "@/components/page-intro";
import { PageSectionList } from "@/components/page-section-list";
import { getSiteContent } from "@/lib/content";
import { Icon } from "@/components/icon";
export async function generateMetadata() { return pageMetadata("facilities"); }
export default async function FacilitiesPage() {
  const { pages } = await getSiteContent(); const page = pages.facilities;
  return <><PageHero title={page.title} subtitle={page.subtitle}/><PageIntro page={page}/><PageSectionList sections={page.sections || []} title={String(page.sectionsTitle || "Experiences that help learning grow")} subtitle={String(page.sectionsSubtitle || "The school administration should update this page to reflect facilities and activities currently available on campus.")}/><div className="wrap"><p className="notice-disclaimer">{String(page.imageDisclaimer || "Images on this page are illustrative placeholders, not verified photographs of academy facilities. Please confirm all facility descriptions before publishing.")}</p></div></>;
}
