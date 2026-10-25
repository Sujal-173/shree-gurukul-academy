import type { ContentSection } from "@/lib/types";
import { ContentCards } from "@/components/content-cards";
import { SectionHeading } from "@/components/section-heading";

export function PageSectionList({ sections, title = "More to explore", subtitle = "Learn more about our approach.", variant = "soft" }: { sections: ContentSection[]; title?: string; subtitle?: string; variant?: "soft" | "plain" }) {
  if (!sections?.length) return null;
  return <section className={`section-pad ${variant === "soft" ? "section-soft" : ""}`}><div className="wrap"><SectionHeading title={title} subtitle={subtitle}/><ContentCards items={sections} columns={sections.length === 2 ? 2 : 3}/></div></section>;
}
