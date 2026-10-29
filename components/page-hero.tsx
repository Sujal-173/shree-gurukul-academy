import Link from "next/link";
import { Icon } from "@/components/icon";
import { getSiteUrl } from "@/lib/site-url";
import { serializeJsonLd } from "@/lib/jsonld";

export function PageHero({ title, subtitle, path }: { title: string; subtitle: string; path?: string }) {
  const siteUrl = getSiteUrl();
  const absolutePath = path ? new URL(path, siteUrl).toString() : undefined;
  const breadcrumbSchema = absolutePath ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl.toString() },
      { "@type": "ListItem", position: 2, name: title, item: absolutePath },
    ],
  } : undefined;
  return (<>
    {breadcrumbSchema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} /> : null}
    <section className="page-hero">
      <div className="page-hero-pattern" aria-hidden="true"/>
      <div className="wrap page-hero-inner">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <nav aria-label="Breadcrumb" className="breadcrumbs">
          <Link href="/" className="breadcrumb-home"><Icon name="home" size={13}/> Home</Link>
          <Icon name="chevron-right" size={13} className="breadcrumb-chevron"/>
          <span aria-current="page">{title}</span>
        </nav>
      </div>
    </section>
  </>);
}
