import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PublicMotion } from "@/components/public-motion";
import { getSiteContent } from "@/lib/content";
import { getSiteUrl } from "@/lib/site-url";
import { serializeJsonLd } from "@/lib/jsonld";

export default async function WebsiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content = await getSiteContent();
  const siteUrl = getSiteUrl();
  const locationName = content.brand.subtitle
    .toLocaleLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toLocaleUpperCase());
  const phoneDigits = content.brand.phone.replace(/\D/g, "");
  const telephone = phoneDigits.length === 10 ? `+91${phoneDigits}` : phoneDigits.startsWith("91") ? `+${phoneDigits}` : `+${phoneDigits}`;
  const socialImage = content.seo.socialImage?.trim() || "/images/og-academy.webp";
  const imageUrl = /^https?:\/\//i.test(socialImage)
    ? socialImage
    : new URL(socialImage.startsWith("/") ? socialImage : `/${socialImage}`, siteUrl).toString();
  const schoolSchema = {
    "@context": "https://schema.org",
    "@type": "School",
    "@id": `${siteUrl.toString()}#school`,
    name: content.brand.name,
    alternateName: `${content.brand.shortName} ${locationName}`.trim(),
    description: content.seo.description,
    url: siteUrl.toString(),
    logo: new URL(content.brand.logoUrl || "/images/crest.webp", siteUrl).toString(),
    image: imageUrl,
    telephone,
    email: content.brand.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "New Lepa",
      addressLocality: "Kasrawad",
      addressRegion: "Madhya Pradesh",
      postalCode: "451228",
      addressCountry: "IN",
    },
    sameAs: [content.brand.instagram].filter((url) => /^https:\/\//i.test(url)),
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl.toString()}#website`,
    name: `${content.brand.name} ${locationName}`.trim(),
    url: siteUrl.toString(),
    inLanguage: "en-IN",
    publisher: { "@id": `${siteUrl.toString()}#school` },
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd([schoolSchema, websiteSchema]) }}/>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <SiteHeader name={content.brand.shortName} subtitle={content.brand.subtitle} logoUrl={content.brand.logoUrl} navigation={content.navigation} enquiryLabel={content.brand.enquiryLabel} enquiryHref={content.brand.enquiryHref}/>
    <main id="main-content"><PublicMotion>{children}</PublicMotion></main>
    <SiteFooter content={content}/>
  </>;
}
