"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { cmsPageDefinitions } from "@/lib/cms-page-map";
import { Icon } from "@/components/icon";

const commonPages = ["home", "notices", "calendar", "gallery"];

export function CmsPageSwitcher({
  currentSlug,
  hasUnsavedChanges = false,
}: {
  currentSlug?: string;
  hasUnsavedChanges?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const matchingPages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];
    return cmsPageDefinitions
      .filter((page) => page.slug !== currentSlug)
      .filter((page) => `${page.label} ${page.group} ${page.description}`.toLowerCase().includes(normalizedQuery))
      .slice(0, 6);
  }, [currentSlug, query]);

  function confirmNavigation(event: MouseEvent<HTMLAnchorElement>) {
    if (hasUnsavedChanges && !window.confirm("You have unsaved edits. Leave this page and discard them?")) {
      event.preventDefault();
    }
  }

  return (
    <section className="cms-page-switcher" aria-label="Quick page navigation">
      <label htmlFor="cms-page-search">Jump to a page to edit</label>
      <div className="cms-page-search-wrap">
        <Icon name="search" size={17} />
        <input
          id="cms-page-search"
          type="search"
          value={query}
          placeholder="Search pages, e.g. Notices or Calendar"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={isOpen && query.trim().length > 0}
          aria-controls="cms-page-search-results"
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setQuery("");
              setIsOpen(false);
              event.currentTarget.blur();
            }
          }}
        />
      </div>
      <div className="cms-page-shortcuts" aria-label="Popular page editors">
        {commonPages.map((slug) => {
          const page = cmsPageDefinitions.find((item) => item.slug === slug);
          if (!page || page.slug === currentSlug) return null;
          return (
            <Link href={`/admin/pages/${page.slug}`} key={page.slug} onClick={confirmNavigation}>
              <Icon name={page.icon} size={14} />
              {page.label}
            </Link>
          );
        })}
      </div>
      {isOpen && query.trim() && (
        <div className="cms-page-search-results" id="cms-page-search-results" role="listbox" aria-label="Matching page editors">
          {matchingPages.length ? matchingPages.map((page) => (
            <Link
              href={`/admin/pages/${page.slug}`}
              key={page.slug}
              role="option"
              aria-selected="false"
              onMouseDown={(event) => event.preventDefault()}
              onClick={(event) => {
                confirmNavigation(event);
                if (!event.defaultPrevented) setIsOpen(false);
              }}
            >
              <span className="cms-page-search-icon"><Icon name={page.icon} size={17} /></span>
              <span><strong>{page.label}</strong><small>{page.group}</small></span>
              <Icon name="arrow-up-right" size={15} />
            </Link>
          )) : <p role="status">No page editors match “{query.trim()}”.</p>}
        </div>
      )}
    </section>
  );
}
