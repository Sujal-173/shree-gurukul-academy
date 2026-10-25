import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { PageIntro } from "@/components/page-intro";
import { PageSectionList } from "@/components/page-section-list";
import { getSiteContent } from "@/lib/content";
import { Icon } from "@/components/icon";
export async function generateMetadata() {
  return pageMetadata("vision");
}
export default async function VisionPage() {
  const { pages } = await getSiteContent();
  const page = pages.vision;
  return (
    <>
      <PageHero title={page.title} subtitle={page.subtitle} />
      <PageIntro page={page} />
      <section className="section-pad section-soft">
        <div className="wrap">
          <div className="vision-feature-grid">
            {(page.sections || []).slice(0, 2).map((section, index) => (
              <article
                className={`vision-feature vision-feature-2`}
                key={section.title}
              >
                <span className="vision-feature-icon">
                  <Icon name={index === 0 ? "eye" : "target"} size={30} />
                </span>
                <span className="eyebrow">
                  0{index + 1} /{" "}
                  {String(page.visionFeatureEyebrow || "OUR FOUNDATION")}
                </span>
                <h2>{section.title}</h2>
                <p>{section.description}</p>
              </article>
            ))}
          </div>
          <p className="notice-disclaimer">
            {String(
              page.visionDisclaimer ||
                "These statements are proposed website copy, not attributed to school leadership. The school should replace them with its approved vision and mission statements.",
            )}
          </p>
        </div>
      </section>
      <PageSectionList
        sections={(page.sections || []).slice(2)}
        title={String(page.valuesSectionTitle || "Values we want to practise")}
        subtitle={String(
          page.valuesSectionSubtitle ||
            "A set of principles that can guide daily choices and relationships.",
        )}
        variant="plain"
      />
    </>
  );
}
