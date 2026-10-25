import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { PageIntro } from "@/components/page-intro";
import { PageSectionList } from "@/components/page-section-list";
import { getSiteContent } from "@/lib/content";
export async function generateMetadata() { return pageMetadata("schoolLife"); }
export default async function SchoolLifePage() {
  const { pages } = await getSiteContent(); const page = pages.schoolLife;
  return <><PageHero title={page.title} subtitle={page.subtitle}/><PageIntro page={page}/><PageSectionList sections={page.sections || []} title={String(page.sectionsTitle || "Learn. Explore. Take part.")} subtitle={String(page.sectionsSubtitle || "Replace these illustrative examples with verified school activities and photographs.")}/><div className="wrap"><p className="notice-disclaimer">{String(page.schoolLifeDisclaimer || "The images are generated illustrations and do not document actual academy events. Upload approved images and edit descriptions in the admin panel before launch.")}</p></div></>;
}
