import type { Metadata, Viewport } from "next";
import "./globals.css";
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
  const title =
    content.seo.title || `${content.brand.name} | ${content.brand.gradeRange}`;
  const description = content.seo.description || content.brand.tagline;
  const image = content.seo.socialImage?.startsWith("http")
    ? content.seo.socialImage
    : siteUrl
      ? new URL(content.seo.socialImage || "/images/campus-illustration.png", siteUrl).toString()
      : undefined;
  return {
    ...(siteUrl ? { metadataBase: siteUrl } : {}),
    title,
    description,
    keywords: content.seo.keywords,
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: content.brand.name,
      title,
      description,
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.variable} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
