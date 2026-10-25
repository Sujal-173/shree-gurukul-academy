import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PublicMotion } from "@/components/public-motion";
import { getSiteContent } from "@/lib/content";
import { getSiteUrl } from "@/lib/site-url";

export default async function WebsiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content = await getSiteContent();
  const siteUrl = getSiteUrl();
  const locationName = content.brand.subtitle
    .toLocaleLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toLocaleUpperCase());
  const schoolSchema = {
    "@context": "https://schema.org",
    "@type": "School",
    name: `${content.brand.name} ${locationName}`.trim(),
    description: content.seo.description,
    ...(siteUrl ? { url: siteUrl.toString() } : {}),
    telephone: `+91${content.brand.phone.replace(/\D/g, "")}`,
    email: content.brand.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "New Lepa, Kasrawad",
      addressRegion: "Madhya Pradesh",
      postalCode: "451228",
      addressCountry: "IN",
    },
    sameAs: [content.brand.instagram].filter(Boolean),
  };
  const serializedSchoolSchema = JSON.stringify(schoolSchema).replace(/[<>&]/g, (character) => {
    const escapes: Record<string, string> = {
      "<": "\\u003c",
      ">": "\\u003e",
      "&": "\\u0026",
    };
    return escapes[character];
  });
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializedSchoolSchema }}/>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <SiteHeader name={content.brand.shortName} subtitle={content.brand.subtitle} logoUrl={content.brand.logoUrl} navigation={content.navigation} enquiryLabel={content.brand.enquiryLabel} enquiryHref={content.brand.enquiryHref}/>
    <main id="main-content"><PublicMotion>{children}</PublicMotion></main>
    <SiteFooter content={content}/>
  </>;
}
