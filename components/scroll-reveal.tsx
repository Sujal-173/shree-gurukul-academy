"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
};

/**
 * Reveals an item once it enters the viewport. Content remains visible if
 * JavaScript/IntersectionObserver is unavailable, and reduced-motion users
 * never receive a sliding animation.
 */
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      element.classList.add("is-visible");
      return;
    }

    element.style.setProperty("--reveal-delay", `${Math.max(0, delay)}ms`);
    element.classList.add("reveal-pending");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        // The timeline line is drawn as its first item enters the viewport.
        element.closest(".process-list")?.classList.add("timeline-active");
        element.classList.add("is-visible");
        element.classList.remove("reveal-pending");
        observer.unobserve(element);
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -36px 0px",
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={elementRef}
      className={`scroll-reveal scroll-reveal-${direction} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
