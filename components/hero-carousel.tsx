"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { HeroSlide } from "@/lib/types";
import { Icon } from "@/components/icon";

const motionPreference = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(onChange: () => void) {
  const media = window.matchMedia(motionPreference);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getMotionPreference() {
  return window.matchMedia(motionPreference).matches;
}

export function HeroCarousel({ slides, gradeRange = "Classes 1–10", captionTitle = "Learning. Values. Growth.", captionSubtitle = "Every step matters.", locationLabel = "NEW LEPA · MADHYA PRADESH", emblemUrl = "/images/crest.webp" }: { slides: HeroSlide[]; gradeRange?: string; captionTitle?: string; captionSubtitle?: string; locationLabel?: string; emblemUrl?: string }) {
  const safeSlides = slides.length ? slides : [];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeToMotionPreference, getMotionPreference, () => false);
  useEffect(() => {
    if (!slides.length) return;
    // Only warm the visible slide and its immediate successor. Preloading every
    // CMS-added slide can waste bandwidth and hurt mobile performance.
    const nextIndex = (index + 1) % slides.length;
    const urls = Array.from(new Set([slides[index]?.image, slides[nextIndex]?.image].filter((url): url is string => Boolean(url))));
    urls.forEach((url) => { const preload = new window.Image(); preload.decoding = "async"; preload.src = url; });
  }, [slides, index]);
  useEffect(() => {
    if (safeSlides.length < 2 || paused || reducedMotion) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % safeSlides.length), 6000);
    return () => window.clearInterval(timer);
  }, [safeSlides.length, paused, reducedMotion]);
  if (!safeSlides.length) return null;
  const slide = safeSlides[index % safeSlides.length];
  return <section className="home-hero" aria-roledescription="carousel" aria-label="School highlights" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }}>
    <div className="hero-ribbon" aria-hidden="true"/><div className="wrap hero-layout">
      <div className="hero-copy" key={`copy-${index}`}>
        <Image className="hero-school-emblem" src={emblemUrl || "/images/crest.webp"} alt="" width={86} height={96} priority/>
        <span className="hero-eyebrow"><span className="eyebrow-dot"/>{slide.eyebrow}</span>
        <h1>{slide.title}<br/><em>{slide.highlight}</em></h1>
        <p>{slide.subtitle}</p>
        <div className="hero-actions"><Link className="button button-gold" href={slide.primaryHref}>{slide.primaryLabel} <Icon name="arrow-up-right" size={16}/></Link><Link className="button button-ghost" href={slide.secondaryHref}>{slide.secondaryLabel}</Link></div>
        <div className="hero-meta"><span className="meta-rule"/><span>{gradeRange.toUpperCase()}</span><span className="meta-separator">/</span><span>{locationLabel}</span></div>
      </div>
      <div className="hero-visual" key={`visual-${index}`}>
        <Image src={slide.image} alt={slide.alt} fill priority={index === 0} sizes="(max-width: 760px) 100vw, 48vw" className="hero-image" />
        <div className="hero-image-frame" aria-hidden="true"/>
        <div className="hero-image-caption"><span className="caption-spark"><Icon name="sparkles" size={20}/></span><span><strong>{captionTitle}</strong><small>{captionSubtitle}</small></span></div>
      </div>
    </div>
    <div className="wrap hero-bottom"><span className="hero-counter"><b>{String(index + 1).padStart(2, "0")}</b><span>/</span>{String(safeSlides.length).padStart(2, "0")}</span><div className="hero-dots" role="group" aria-label="Choose slide">{safeSlides.map((item, dotIndex) => <button key={`${item.title}-${dotIndex}`} type="button" aria-label={`Show slide ${dotIndex + 1}: ${item.title}`} aria-pressed={dotIndex === index} className={dotIndex === index ? "hero-dot active" : "hero-dot"} onClick={() => setIndex(dotIndex)}/>)}</div><button className="hero-next" type="button" aria-label="Next slide" onClick={() => setIndex((index + 1) % safeSlides.length)}><Icon name="arrow-right" size={20}/></button></div>
  </section>;
}
