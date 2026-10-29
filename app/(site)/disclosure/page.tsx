import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { PageIntro } from "@/components/page-intro";
import { PageSectionList } from "@/components/page-section-list";
import { getSiteContent } from "@/lib/content";
import { Icon } from "@/components/icon";
import { PageFaqs } from "@/components/page-faqs";
export async function generateMetadata() { return pageMetadata("disclosure"); }
export default async function DisclosurePage() {
  const { pages } = await getSiteContent(); const page = pages.disclosure;
  return <><PageHero title={page.title} subtitle={page.subtitle} path="/disclosure"/><PageIntro page={page}/><section className="section-pad section-soft"><div className="wrap"><div className="document-header"><div><span className="eyebrow">{String(page.documentEyebrow || "SCHOOL RECORDS")}</span><h2>{String(page.documentTitle || "Published documents")}</h2><p>{String(page.documentDescription || "Only documents uploaded or linked by the school administration appear here.")}</p></div><span className="document-symbol"><Icon name="file-text" size={31}/></span></div>{page.documents?.length ? <div className="document-list">{page.documents.map((doc, i) => <article className="document-row" key={`${doc.title}-${i}`}><span className="document-file-icon"><Icon name="file-text" size={23}/><small>PDF</small></span><div><h3>{doc.title}</h3><p>{doc.description}</p>{doc.updatedAt && <small>Updated: {doc.updatedAt}</small>}</div><a href={doc.url} target="_blank" rel="noreferrer" className="button button-outline">Open document <Icon name="external-link" size={14}/></a></article>)}</div> : <div className="empty-state"><Icon name="file-text" size={29}/><p>{String(page.documentsEmptyText || "No school documents have been published yet. Please contact the office for current approved records.")}</p></div>}</div></section><PageSectionList sections={page.sections || []} title={String(page.recordsTitle || "About school records")} subtitle={String(page.recordsSubtitle || "The administration should keep published information accurate and current.")} variant="plain"/><PageFaqs faqs={page.faqs || []} title="Questions about school records" subtitle="The school office can tell you whether a record is available and approved for sharing."/></>;
}
