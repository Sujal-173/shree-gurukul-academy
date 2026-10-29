import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { PageIntro } from "@/components/page-intro";
import { PageSectionList } from "@/components/page-section-list";
import { getSiteContent } from "@/lib/content";

export async function generateMetadata() {
  return pageMetadata("schoolLife");
}

export default async function SchoolLifePage() {
  const { pages } = await getSiteContent();
  const page = pages.schoolLife;
  const savedSubtitle = String(page.sectionsSubtitle || "").trim();
  const editorialPlaceholder = /(?:replace these illustrative examples|school administration should update|update this page)/i.test(savedSubtitle);
  const sectionsSubtitle = editorialPlaceholder
    ? "Discover examples of creativity, teamwork and participation. Contact the academy for current information about clubs, events and school activities."
    : savedSubtitle || "Discover the kinds of learning, participation and school-life experiences the academy shares with its community.";
  const disclaimer = String(page.schoolLifeDisclaimer || "The images on this page are illustrative examples of learning and participation, not photographs documenting actual academy activities.");

  return (
    <>
      <PageHero title={page.title} subtitle={page.subtitle} path="/school-life" />
      <PageIntro page={page} />
      <PageSectionList
        sections={page.sections || []}
        title={String(page.sectionsTitle || "Learn. Explore. Take part.")}
        subtitle={sectionsSubtitle}
      />
      <div className="wrap">
        <p className="notice-disclaimer">{disclaimer}</p>
      </div>
    </>
  );
}
