import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./public-page-refresh.css";
import { Outfit } from "next/font/google";
import { getSiteContent } from "@/lib/content";
import { getSiteUrl } from "@/lib/site-url";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#721c24",
  colorScheme: "light",
};

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const siteUrl = getSiteUrl();
  const title = content.seo.title?.trim() || `${content.brand.name} New Lepa | Classes 1–10`;
  const description = content.seo.description?.trim() || content.brand.tagline;
  const imageValue = content.seo.socialImage?.trim() || "/images/og-academy.webp";
  const image = /^https?:\/\//i.test(imageValue) ? imageValue : new URL(imageValue.startsWith("/") ? imageValue : `/${imageValue}`, siteUrl).toString();
  const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  return {
    metadataBase: siteUrl,
    applicationName: `${content.brand.name} ${content.brand.subtitle}`.trim(),
    title,
    description,
    keywords: content.seo.keywords,
    authors: [{ name: content.brand.name, url: siteUrl.toString() }],
    creator: content.brand.name,
    publisher: content.brand.name,
    category: "education",
    alternates: { canonical: "/" },
    openGraph: {
      type: "website", locale: "en_IN", siteName: content.brand.name, title, description,
      url: siteUrl.toString(), countryName: "India",
      images: [{ url: image, alt: `${content.brand.name} New Lepa website preview image` }],
    },
    twitter: {
      card: "summary_large_image", title, description, images: [{ url: image, alt: `${content.brand.name} New Lepa website preview illustration` }],
    },
    ...(googleVerification ? { verification: { google: googleVerification } } : {}),
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <body className={outfit.variable} suppressHydrationWarning>{children}</body>
    </html>
  );
}
