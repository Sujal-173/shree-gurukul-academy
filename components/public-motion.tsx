"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function PublicMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        "#main-content > :not(.page-hero), #main-content .section-pad, #main-content .content-card, #main-content .notice-page-card, #main-content .document-row",
      ),
    );

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    root.classList.add("public-motion-ready");
    elements.forEach((element, index) => {
      element.classList.add("public-motion-item", "public-motion-pending");
      element.style.setProperty("--public-motion-delay", `${(index % 4) * 65}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("public-motion-visible");
          entry.target.classList.remove("public-motion-pending");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -28px 0px" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      elements.forEach((element) => {
        element.classList.remove("public-motion-item", "public-motion-pending", "public-motion-visible");
        element.style.removeProperty("--public-motion-delay");
      });
      root.classList.remove("public-motion-ready");
    };
  }, [pathname]);

  return <>{children}</>;
}
