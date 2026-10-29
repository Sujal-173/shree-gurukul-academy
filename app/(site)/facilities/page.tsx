import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { PageIntro } from "@/components/page-intro";
import { PageSectionList } from "@/components/page-section-list";
import { PageFaqs } from "@/components/page-faqs";
import { getSiteContent } from "@/lib/content";

export async function generateMetadata() {
  return pageMetadata("facilities");
}

export default async function FacilitiesPage() {
  const { pages } = await getSiteContent();
  const page = pages.facilities;
  const savedSubtitle = String(page.sectionsSubtitle || "").trim();
  const editorialPlaceholder = /(?:the school administration should update|update this page|replace these illustrative examples)/i.test(savedSubtitle);
  const sectionsSubtitle = editorialPlaceholder
    ? "Explore learning experiences that can build knowledge, confidence and healthy habits. Contact the school office to confirm which facilities and activities are currently available."
    : savedSubtitle || "Explore the learning experiences featured here. Contact the school office to confirm which facilities and activities are currently available.";
  const disclaimer = String(page.imageDisclaimer || "Images on this page are illustrative. Contact the school office to confirm current campus facilities and activities.");

  return (
    <>
      <PageHero title={page.title} subtitle={page.subtitle} path="/facilities" />
      <PageIntro page={page} />
      <PageSectionList
        sections={page.sections || []}
        title={String(page.sectionsTitle || "Experiences that help learning grow")}
        subtitle={sectionsSubtitle}
      />
      <div className="wrap">
        <p className="notice-disclaimer">{disclaimer}</p>
      </div>
      <PageFaqs faqs={page.faqs || []} title="Questions about the campus" subtitle="Contact the school to confirm current facilities and visit arrangements."/>
    </>
  );
}
