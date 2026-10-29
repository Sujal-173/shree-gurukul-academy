import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { PageIntro } from "@/components/page-intro";
import { getSiteContent } from "@/lib/content";
import { Icon } from "@/components/icon";
import { PublicFileAttachment } from "@/components/public-file-attachment";
import { combinePublishedNotices } from "@/lib/notices";
import type { NoticeItem } from "@/lib/types";

export async function generateMetadata() { return pageMetadata("notices"); }

export default async function NoticesPage() {
  const content = await getSiteContent();
  const page = content.pages.notices;
  const pageNotices = Array.isArray(page.notices) ? page.notices as NoticeItem[] : [];
  const homeNotices = Array.isArray(content.home.notices) ? content.home.notices : [];
  const notices = combinePublishedNotices(pageNotices, homeNotices);

  return <>
    <PageHero title={page.title} subtitle={page.subtitle} path="/notices" />
    <PageIntro page={page} />
    <section className="section-pad notices-page-section">
      <div className="wrap notices-page-list">
        {notices.length ? notices.map((notice, index) => <article className="notice-page-card" key={notice.id || `${notice.title}-${index}`}>
          <div className="notice-page-number">{String(index + 1).padStart(2, "0")}</div>
          <div className="notice-page-content">
            <div className="notice-page-copy">
              <span className="notice-category">{notice.category}{notice.date ? ` · ${notice.date}` : ""}</span>
              <h2>{notice.title}</h2>
              {notice.description && <p>{notice.description}</p>}
            </div>
            {notice.imageUrl && <a className="notice-page-image" href={notice.imageUrl} target="_blank" rel="noopener noreferrer"><Image src={notice.imageUrl} alt={notice.imageAlt || notice.title} width={1100} height={700} unoptimized sizes="(max-width: 760px) 100vw, 680px" /></a>}
            {notice.attachmentUrl && <PublicFileAttachment url={notice.attachmentUrl} name={notice.attachmentName} mimeType={notice.attachmentType} alt={notice.imageAlt || notice.title} label="Open notice attachment" />}
          </div>
        </article>) : <div className="empty-state"><Icon name="bell" size={29}/><p>No current notices have been posted. For an update you need today, please contact the school office.</p></div>}
      </div>
    </section>
  </>;
}
