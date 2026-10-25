import Link from "next/link";
import { Icon } from "@/components/icon";

export function PageHero({ title, subtitle }: { title: string; subtitle: string }) {
  return <section className="page-hero"><div className="page-hero-pattern" aria-hidden="true"/><div className="wrap page-hero-inner"><h1>{title}</h1><p>{subtitle}</p><nav aria-label="Breadcrumb" className="breadcrumbs"><Link href="/" className="breadcrumb-home"><Icon name="home" size={13}/> Home</Link><Icon name="chevron-right" size={13} className="breadcrumb-chevron"/><span aria-current="page">{title}</span></nav></div></section>;
}
