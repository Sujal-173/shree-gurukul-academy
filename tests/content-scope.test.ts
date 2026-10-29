import { describe, expect, it } from "vitest";
import { allowedContentScopes, mergeScopedContent } from "../lib/content-scope";
import { cmsPageDefinitions } from "../lib/cms-page-map";
import { defaultContent } from "../lib/default-content";
import { safeHref } from "../lib/sanitize-content";

describe("page-scoped CMS", () => {
  it("uses admission as the sole canonical public CMS slug", () => {
    expect(cmsPageDefinitions.find((page) => page.slug === "admission")?.publicPath).toBe("/admission");
    expect(cmsPageDefinitions.some((page) => page.slug === "admissions")).toBe(false);
    expect(allowedContentScopes.has("admission")).toBe(true);
    expect(allowedContentScopes.has("admissions")).toBe(false);
  });

  it("normalizes legacy plural admission links before rendering or saving", () => {
    expect(safeHref("/admissions")).toBe("/admission");
    expect(safeHref("/admissions#enquiry")).toBe("/admission#enquiry");
    expect(safeHref("/academics")).toBe("/academics");
  });
  it("has an editor for each site page and settings", () => {
    expect(cmsPageDefinitions).toHaveLength(14);
    for (const page of cmsPageDefinitions) {
      if (page.slug === "site-settings") continue;
      if (page.key === "home") expect(defaultContent.home).toBeTruthy();
      else expect(defaultContent.pages[page.key], `missing content key ${page.key}`).toBeTruthy();
      expect(allowedContentScopes.has(page.slug), `missing allowed scope ${page.slug}`).toBe(true);
    }
  });

  it("updates the selected page while preserving other page content", () => {
    const current = { home: { title: "Current home" }, pages: { about: { title: "Current about" }, academics: { title: "Current academics" } } };
    const incoming = { home: { title: "Stale home draft" }, pages: { about: { title: "Updated about" }, academics: { title: "Stale academics draft" } } };
    expect(mergeScopedContent(current, incoming, "about")).toEqual({
      home: { title: "Current home" },
      pages: { about: { title: "Updated about" }, academics: { title: "Current academics" } },
    });
  });

  it("maps the school-life public slug to its stored content key", () => {
    const current = { home: {}, pages: { schoolLife: { title: "Old" }, about: { title: "Preserve" } } };
    const incoming = { home: {}, pages: { schoolLife: { title: "New" }, about: { title: "Stale" } } };
    expect(mergeScopedContent(current, incoming, "school-life")).toEqual({ home: {}, pages: { schoolLife: { title: "New" }, about: { title: "Preserve" } } });
  });

  it("saves structured calendar entries without overwriting homepage content", () => {
    const current = {
      home: { notices: [{ id: "current-notice" }], introTitle: "Current homepage" },
      pages: { calendar: { title: "Old calendar", calendarEntries: [] }, about: { title: "Preserve" } },
    };
    const incoming = {
      home: { notices: [{ id: "stale-notice" }], introTitle: "Stale homepage" },
      pages: { calendar: { title: "New calendar", calendarEntries: [{ id: "event-1", category: "Events & Celebrations", title: "Annual Day", date: "2026-12-15", active: false }] }, about: { title: "Stale about" } },
    };
    expect(mergeScopedContent(current, incoming, "calendar")).toEqual({
      home: { notices: [{ id: "current-notice" }], introTitle: "Current homepage" },
      pages: { calendar: { title: "New calendar", calendarEntries: [{ id: "event-1", category: "Events & Celebrations", title: "Annual Day", date: "2026-12-15", active: false }] }, about: { title: "Preserve" } },
    });
  });

  it("limits site settings saves to brand, navigation, footer and SEO", () => {
    const current = { home: { title: "Preserve" }, pages: { about: { title: "Preserve" } }, brand: { name: "Old" }, navigation: [], footer: {}, seo: { title: "Old SEO" } };
    const incoming = { home: { title: "Stale" }, pages: { about: { title: "Stale" } }, brand: { name: "New" }, navigation: [{ label: "New" }], footer: { description: "New footer" }, seo: { title: "New SEO" } };
    expect(mergeScopedContent(current, incoming, "site-settings")).toEqual({ home: { title: "Preserve" }, pages: { about: { title: "Preserve" } }, brand: { name: "New" }, navigation: [{ label: "New" }], footer: { description: "New footer" }, seo: { title: "New SEO" } });
  });
});
