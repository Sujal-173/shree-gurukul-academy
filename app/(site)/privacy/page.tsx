import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { PageIntro } from "@/components/page-intro";
import { PageSectionList } from "@/components/page-section-list";
import { getSiteContent } from "@/lib/content";
export async function generateMetadata() { return pageMetadata("privacy"); }
export default async function PrivacyPage() {
  const { pages } = await getSiteContent(); const page = pages.privacy;
  const implementationNote = typeof page.privacyImplementationNote === "string" ? page.privacyImplementationNote : "";
  return <><PageHero title={page.title} subtitle={page.subtitle} path="/privacy"/><PageIntro page={page}/><PageSectionList sections={page.sections || []} title={String(page.privacySectionsTitle || "Privacy principles")} subtitle={String(page.privacySectionsSubtitle || "This page explains how information submitted through this website is intended to be handled.")} variant="plain"/>{implementationNote.trim() ? <div className="wrap privacy-review-note">{implementationNote}</div> : null}</>;
}
