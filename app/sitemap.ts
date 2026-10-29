import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const pages = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1.0 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/academics", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/admission", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/facilities", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/notices", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/calendar", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/calendar/events", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/calendar/holidays", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/calendar/exams", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/gallery", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/vision", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/disclosure", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/school-life", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  return pages.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, siteUrl).toString(),
    changeFrequency,
    priority,
  }));
}
