import Image from "next/image";
import Link from "next/link";
import type { ContentSection } from "@/lib/types";
import { Icon, type IconName } from "@/components/icon";

function cardIcon(title: string): IconName {
  const text = title.toLowerCase();
  if (text.includes("academ") || text.includes("learn") || text.includes("class")) return "book-open";
  if (text.includes("science") || text.includes("experiment")) return "microscope";
  if (text.includes("sport") || text.includes("physical") || text.includes("fitness")) return "dumbbell";
  if (text.includes("library") || text.includes("read")) return "library";
  if (text.includes("art") || text.includes("creativ")) return "palette";
  if (text.includes("safety") || text.includes("respect") || text.includes("trust")) return "shield-check";
  if (text.includes("team") || text.includes("community") || text.includes("family")) return "users";
  if (text.includes("vision")) return "eye";
  if (text.includes("mission") || text.includes("goal")) return "target";
  if (text.includes("notice") || text.includes("announcement")) return "bell";
  return "sparkles";
}

export function ContentCards({ items, columns = 3, imageHeight = 205 }: { items: ContentSection[]; columns?: 2 | 3 | 4; imageHeight?: number }) {
  if (!items?.length) return <div className="empty-state"><Icon name="sparkles" size={28}/><p>More information will be published by the school administration.</p></div>;
  return <div className={`content-grid cols-${columns}`}>{items.map((item, i) => <article className="content-card" key={`${item.title}-${i}`}>
    {item.image ? <div className="content-card-media" style={{ height: imageHeight }}><Image src={item.image} alt={item.alt || item.title} fill sizes="(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 33vw"/></div> : <div className="content-card-icon" aria-hidden="true"><Icon name={cardIcon(item.title)} size={27}/></div>}
    <div className="content-card-body">{item.eyebrow && <span className="card-eyebrow">{item.eyebrow}</span>}{item.tag && <span className="card-tag">{item.tag}</span>}<h3>{item.title}</h3><p>{item.description}</p>{item.items && item.items.length > 0 && <ul className="inline-list">{item.items.map((entry) => <li key={entry}>{entry}</li>)}</ul>}{item.href && <Link href={item.href} className="text-link">Explore <Icon name="arrow-up-right" size={15}/></Link>}</div>
  </article>)}</div>;
}
