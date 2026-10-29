import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { GalleryExperience } from "@/components/gallery-experience";
import { getSiteContent } from "@/lib/content";
export async function generateMetadata() { return pageMetadata("gallery"); }
export default async function GalleryPage() {
  const { pages } = await getSiteContent(); const page = pages.gallery;
  return <><PageHero title={page.title} subtitle={page.subtitle} path="/gallery"/><section className="gallery-page-section"><div className="wrap"><GalleryExperience items={page.sections || []}/><p className="notice-disclaimer">{String(page.galleryDisclaimer || "The images shown are illustrative examples, not records of actual academy events. Official photographs will appear here when approved by the school.")}</p></div></section></>;
}
