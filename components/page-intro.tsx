import Image from "next/image";
import type { PageCopy } from "@/lib/types";
import { Icon, type IconName } from "@/components/icon";

function pageIcon(title: string): IconName {
  const text = title.toLowerCase();
  if (text.includes("about")) return "building";
  if (text.includes("academic")) return "book-open";
  if (text.includes("admission")) return "graduation-cap";
  if (text.includes("facilit")) return "library";
  if (text.includes("notice")) return "bell";
  if (text.includes("gallery")) return "images";
  if (text.includes("vision")) return "eye";
  if (text.includes("contact")) return "mail";
  if (text.includes("calendar")) return "calendar-days";
  if (text.includes("disclosure")) return "file-text";
  if (text.includes("life")) return "sparkles";
  return "book-open";
}

export function PageIntro({ page }: { page: PageCopy }) {
  return <section className="page-intro section-pad"><div className={`wrap split-layout ${page.image ? "" : "no-image"}`}><div className="split-copy"><span className="eyebrow page-intro-eyebrow"><Icon name={pageIcon(page.title)} size={14}/>{page.title.toUpperCase()}</span><h2>{page.heading}</h2><span className="title-rule"/><p>{page.body}</p></div>{page.image && <div className="split-image"><Image src={page.image} alt={page.imageAlt || page.heading} fill sizes="(max-width: 760px) 100vw, 46vw"/></div>}</div></section>;
}
