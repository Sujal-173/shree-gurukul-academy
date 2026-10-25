import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const paths = ["", "/about", "/academics", "/admission", "/admissions", "/facilities", "/notices", "/gallery", "/vision", "/contact", "/disclosure", "/calendar", "/school-life", "/privacy"];
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return [];

  return paths.map((path) => ({
    url: new URL(path || "/", siteUrl).toString(),
    changeFrequency: path === "" || path === "/notices" ? "weekly" : "monthly",
    priority: path === "" ? 1 : ["/admission", "/admissions", "/contact"].includes(path) ? 0.9 : 0.7,
  }));
}
