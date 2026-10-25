import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { PageIntro } from "@/components/page-intro";
import { getSiteContent } from "@/lib/content";
import { Icon } from "@/components/icon";
export async function generateMetadata() { return pageMetadata("notices"); }
export default async function NoticesPage() {
  const content = await getSiteContent(); const page = content.pages.notices; const notices = (page.notices || content.home.notices).filter((notice) => notice.active);
  return <><PageHero title={page.title} subtitle={page.subtitle}/><PageIntro page={page}/><section className="section-pad"><div className="wrap notices-page-list">{notices.length ? notices.map((notice, i) => <article className="notice-page-card" key={notice.id}><div className="notice-page-number">{String(i + 1).padStart(2, "0")}</div><div className="notice-page-copy"><span className="notice-category">{notice.category}{notice.date ? ` · ${notice.date}` : ""}</span><h2>{notice.title}</h2><p>{notice.description}</p></div></article>) : <div className="empty-state"><Icon name="bell" size={29}/><p>No current notices have been published. Please contact the school office for the latest updates.</p></div>}</div></section></>;
}
