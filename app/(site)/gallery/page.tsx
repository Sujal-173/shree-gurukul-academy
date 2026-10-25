import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { GalleryExperience } from "@/components/gallery-experience";
import { getSiteContent } from "@/lib/content";
export async function generateMetadata() { return pageMetadata("gallery"); }
export default async function GalleryPage() {
  const { pages } = await getSiteContent(); const page = pages.gallery;
  return <><PageHero title={page.title} subtitle={page.subtitle}/><section className="gallery-page-section"><div className="wrap"><GalleryExperience items={page.sections || []}/><p className="notice-disclaimer">{String(page.galleryDisclaimer || "Only publish school-approved photographs and captions.")}</p></div></section></>;
}
