import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { PageIntro } from "@/components/page-intro";
import { PageSectionList } from "@/components/page-section-list";
import { getSiteContent } from "@/lib/content";
export async function generateMetadata() { return pageMetadata("privacy"); }
export default async function PrivacyPage() {
  const { pages } = await getSiteContent(); const page = pages.privacy;
  return <><PageHero title={page.title} subtitle={page.subtitle}/><PageIntro page={page}/><PageSectionList sections={page.sections || []} title={String(page.privacySectionsTitle || "Privacy principles")} subtitle={String(page.privacySectionsSubtitle || "Review this policy with the school and hosting providers before launching publicly.")} variant="plain"/><div className="wrap privacy-review-note"><strong>Implementation note:</strong> {String(page.privacyImplementationNote || "This is a starter privacy notice, not legal advice. The school must verify it against its actual data handling, retention practices, technology providers and applicable law.")}</div></>;
}
