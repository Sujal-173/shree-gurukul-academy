import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { HeroCarousel } from "@/components/hero-carousel";
import { SectionHeading } from "@/components/section-heading";
import { ContentCards } from "@/components/content-cards";
import { getSiteContent } from "@/lib/content";
import { combinePublishedNotices } from "@/lib/notices";
import { Icon, type IconName } from "@/components/icon";
import { PublicFileAttachment } from "@/components/public-file-attachment";

export async function generateMetadata() { return pageMetadata("home"); }
function quickIcon(href: string, configured?: string): IconName {
  const allowed: IconName[] = ["graduation-cap", "bell", "images", "mail", "calendar-days", "building", "book-open", "eye", "sparkles", "map-pin", "phone", "message-circle"];
  if (configured && allowed.includes(configured as IconName)) return configured as IconName;
  if (href.includes("admission")) return "graduation-cap";
  if (href.includes("notices")) return "bell";
  if (href.includes("gallery")) return "images";
  if (href.includes("contact")) return "mail";
  if (href.includes("calendar")) return "calendar-days";
  if (href.includes("facilities")) return "building";
  if (href.includes("academics")) return "book-open";
  if (href.includes("vision")) return "eye";
  return "sparkles";
}
export default async function HomePage() {
  const content = await getSiteContent();
  const { home, brand } = content;
  const visibleNotices = combinePublishedNotices([], Array.isArray(home.notices) ? home.notices : []).slice(0, 3);
  // Do not publish generic placeholder copy as a quote attributed to a named leader.
  const visibleLeaders = home.leaders.filter((leader) => {
    const message = (leader.message || "").toLocaleLowerCase();
    return !message.includes("official message from the management") &&
      !message.includes("contact the school for the current academic guidance");
  });
  const introAccentImage = home.highlights.find((item) => item.image);
  const formatNoticeDate = (value: string, index: number) => {
    const dateMatch = value.trim().match(/^(\d{1,2})[\s/-]+([a-zA-Z]{3,9})/);
    if (dateMatch) return { day: dateMatch[1].padStart(2, "0"), month: dateMatch[2].slice(0, 3).toUpperCase() };
    const isoMatch = value.trim().match(/^\d{4}-(\d{2})-(\d{2})/);
    if (isoMatch) return { day: isoMatch[2], month: new Date(Date.UTC(2024, Number(isoMatch[1]) - 1)).toLocaleString("en", { month: "short", timeZone: "UTC" }).toUpperCase() };
    return { day: String(index + 1).padStart(2, "0"), month: "UPDATE" };
  };
  return <div className="home-page">
    <HeroCarousel slides={home.hero} gradeRange={brand.gradeRange} captionTitle={home.heroCaptionTitle} captionSubtitle={home.heroCaptionSubtitle} locationLabel={home.heroLocationLabel} emblemUrl={brand.logoUrl}/>
    <section className="quick-links-section home-quick-links"><div className="wrap quick-links-grid">{home.quickLinks.map((item) => <Link href={item.href} key={item.href} className="quick-link-card"><span className="quick-link-icon" aria-hidden="true"><Icon name={quickIcon(item.href, item.icon)} size={22}/></span><span className="quick-link-title">{item.label}</span><span className="quick-link-description">{item.description}</span><span className="quick-link-arrow" aria-hidden="true"><Icon name="arrow-up-right" size={16}/></span></Link>)}</div></section>
    <section className="section-pad home-intro"><div className="wrap intro-layout"><div className="intro-copy"><span className="eyebrow">{home.introEyebrow}</span><h2>{home.introTitle}</h2><span className="title-rule"/><p>{home.introBody}</p><div className="intro-points">{String(home.introPoints || "Learning with purpose\nValues and respect\nClasses 1–10\nFamily partnership").split(/\r?\n/).filter(Boolean).map((point, pointIndex) => <span key={`${point}-${pointIndex}`}><Icon name="check-circle" size={16}/> {point}</span>)}</div><Link href={home.introButtonHref || "/about"} className="button button-primary">{home.introButtonLabel || "More About Our Academy"} <Icon name="arrow-up-right" size={16}/></Link></div><div className="intro-media home-intro-media"><Image src={home.introImage} alt={home.introAlt} fill sizes="(max-width: 760px) 100vw, 45vw"/>{introAccentImage?.image && <div className="home-intro-accent"><Image src={introAccentImage.image} alt={introAccentImage.alt || introAccentImage.title} fill sizes="180px"/></div>}<span className="intro-media-badge"><strong>{brand.gradeRange}</strong><small>Ask us about admission</small></span></div></div></section>
    {visibleLeaders.length > 0 && <section className="home-leadership" aria-label={home.leadersTitle}>
      {visibleLeaders.map((leader, index) => <article className="home-leader-row" key={`${leader.role}-${index}`}><div className="wrap home-leader-layout"><div className="home-leader-profile"><div className="leader-mark">{leader.portrait ? <Image src={leader.portrait} alt={leader.alt || leader.role} fill sizes="(max-width: 760px) 100vw, (max-width: 1020px) 320px, 420px"/> : <Image className="home-leader-emblem" src={brand.logoUrl || "/images/crest.webp"} alt={`${brand.name} emblem`} width={92} height={106}/>}</div>{leader.name && <strong>{leader.name}</strong>}{leader.designation && <span>{leader.designation}</span>}<small className="home-leader-school">{brand.name}</small></div><div className="home-leader-message"><span className="eyebrow">{home.leadersEyebrow}</span><h2>{leader.role}</h2><blockquote>{leader.message}</blockquote>{leader.name && <p className="home-leader-signoff">With warm regards,<br/><strong>{leader.name}</strong></p>}</div></div></article>)}
    </section>}
    <section className="section-pad section-soft home-highlights"><div className="wrap"><SectionHeading eyebrow={home.highlightsEyebrow} title={home.highlightsTitle} subtitle={home.highlightsSubtitle}/><ContentCards items={home.highlights} columns={3}/></div></section>
    <section className="stats-band home-stats"><div className="wrap stats-grid">{home.stats.map((stat, index) => <div className="stat-item" key={`${stat.value}-${stat.label}`}><span className="stat-icon" aria-hidden="true"><Icon name={(["graduation-cap", "clock", "users", "heart-handshake"] as IconName[])[index % 4]} size={21}/></span><strong>{stat.value}</strong><p>{stat.label}</p></div>)}</div></section>
    <section className="section-pad home-notices"><div className="wrap home-notices-layout"><div className="home-notices-content"><SectionHeading eyebrow={home.noticesEyebrow} title={home.noticesTitle}/><div className="home-notice-list">{visibleNotices.map((notice, index) => { const date = formatNoticeDate(notice.date, index); const category = notice.category.toLowerCase(); const badge = category.includes("exam") ? "exam" : category.includes("admission") || category.includes("circular") ? "circular" : "general"; return <article className="home-notice-card" key={notice.id}><div className="home-notice-date" aria-label={notice.date || `Update ${index + 1}`}><strong>{date.day}</strong><span>{date.month}</span></div><div className="home-notice-copy"><span className={`home-notice-category ${badge}`}>{notice.category}</span><h3>{notice.title}</h3><p>{notice.description}</p>{notice.imageUrl && <a className="home-notice-image" href={notice.imageUrl} target="_blank" rel="noopener noreferrer"><Image src={notice.imageUrl} alt={notice.imageAlt || notice.title} width={900} height={540} unoptimized sizes="(max-width: 760px) 100vw, 420px" /></a>}{notice.attachmentUrl && <PublicFileAttachment url={notice.attachmentUrl} name={notice.attachmentName} mimeType={notice.attachmentType} alt={notice.imageAlt || notice.title} label="Open notice or circular" />}</div></article>; })}{!visibleNotices.length && <div className="empty-state">No announcements are published right now. For a time-sensitive question, please call the school office.</div>}</div><Link href="/notices" className="button button-gold home-notices-link"><Icon name="arrow-right" size={16}/> View All Notices &amp; Circulars</Link></div></div></section>
    <section className="final-cta"><div className="cta-orbit" aria-hidden="true"/><div className="wrap cta-inner"><span className="eyebrow">{home.ctaEyebrow}</span><h2>{home.ctaTitle}</h2><p>{home.ctaBody}</p><div className="hero-actions"><Link href="/admission#enquiry" className="button button-gold">{home.ctaLabel} <Icon name="arrow-up-right" size={16}/></Link><Link href={home.ctaSecondaryHref || "/contact"} className="button button-ghost">{home.ctaSecondaryLabel || "Contact School Office"}</Link></div></div></section>
  </div>;
}
