"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { ContentSection } from "@/lib/types";
import { getGalleryCategory } from "@/lib/gallery-category";
import { Icon } from "@/components/icon";

const subscribeToPortalRoot = () => () => {};
const getPortalRoot = () => document.body;
const getServerPortalRoot = () => null;

export function GalleryExperience({ items }: { items: ContentSection[] }) {
  const photos = items.filter((item) => item.image);
  const categories = Array.from(new Set(photos.map(getGalleryCategory)));
  const [activeCategory, setActiveCategory] = useState("All photos");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [imageDimensions, setImageDimensions] = useState<Record<string, { width: number; height: number }>>({});
  const [zoom, setZoom] = useState(1);
  const portalRoot = useSyncExternalStore(
    subscribeToPortalRoot,
    getPortalRoot,
    getServerPortalRoot,
  );
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const visiblePhotos = activeCategory === "All photos"
    ? photos
    : photos.filter((photo) => getGalleryCategory(photo) === activeCategory);
  const selectedPhoto = selectedIndex === null ? null : visiblePhotos[selectedIndex];
  const selectedDimensions = selectedPhoto ? imageDimensions[selectedPhoto.image!] : undefined;

  useEffect(() => {
    if (selectedIndex === null || !portalRoot) return;

    const previousOverflow = document.body.style.overflow;
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedIndex(null);
      if (event.key === "ArrowRight") {
        setZoom(1);
        setSelectedIndex((index) => index === null ? null : (index + 1) % visiblePhotos.length);
      }
      if (event.key === "ArrowLeft") {
        setZoom(1);
        setSelectedIndex((index) => index === null ? null : (index - 1 + visiblePhotos.length) % visiblePhotos.length);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      triggerButtonRef.current?.focus();
    };
  }, [portalRoot, selectedIndex, visiblePhotos.length]);

  return (
    <>
      <div className="gallery-filters" role="group" aria-label="Filter gallery by category">
        {["All photos", ...categories].map((category) => (
          <button
            aria-pressed={activeCategory === category}
            className={`gallery-filter${activeCategory === category ? " is-active" : ""}`}
            key={category}
            onClick={() => {
              setActiveCategory(category);
              setSelectedIndex(null);
            }}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>

      {visiblePhotos.length > 0 ? (
        <div className="gallery-grid">
          {visiblePhotos.map((photo, index) => (
            <button
              aria-label={`Open photo: ${photo.title}`}
              className="gallery-photo"
              key={`${photo.title}-${index}`}
              onClick={(event) => {
                triggerButtonRef.current = event.currentTarget;
                setZoom(1);
                setSelectedIndex(index);
              }}
              type="button"
            >
              <Image
                alt={photo.alt || photo.title}
                className="gallery-photo-image"
                fill
                sizes="(max-width: 680px) 100vw, (max-width: 1000px) 50vw, 560px"
                src={photo.image!}
              />
              <span className="gallery-photo-overlay">
                <span className="gallery-photo-category">{getGalleryCategory(photo)}</span>
                <span className="gallery-photo-title">{photo.title}</span>
                <span className="gallery-photo-open" aria-hidden="true"><Icon name="images" size={18}/></span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="gallery-empty">Approved academy photographs will appear here when they are available.</div>
      )}

      {selectedPhoto && portalRoot && createPortal(
        <div
          className="gallery-lightbox gallery-photo-viewer"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedIndex(null);
          }}
          role="presentation"
        >
          <div aria-labelledby="gallery-lightbox-title" aria-modal="true" className="gallery-lightbox-dialog" role="dialog">
            <div className="gallery-lightbox-toolbar">
              <span className="gallery-lightbox-count">{selectedIndex! + 1}/{visiblePhotos.length}</span>
              <div className="gallery-lightbox-tools">
                <button aria-label="Zoom in" className="gallery-lightbox-tool" disabled={zoom >= 3} onClick={() => setZoom((current) => Math.min(3, current + 0.25))} type="button">
                  <Icon name="zoom-in" size={18}/>
                </button>
                <button aria-label="Zoom out" className="gallery-lightbox-tool" disabled={zoom <= 1} onClick={() => setZoom((current) => Math.max(1, current - 0.25))} type="button">
                  <Icon name="zoom-out" size={18}/>
                </button>
                <button aria-label="Fit image to screen" className="gallery-lightbox-tool" disabled={zoom === 1} onClick={() => setZoom(1)} type="button">
                  <Icon name="maximize" size={17}/>
                </button>
                <button aria-label="Close photo viewer" className="gallery-lightbox-close" onClick={() => setSelectedIndex(null)} ref={closeButtonRef} type="button">
                  <Icon name="close" size={20}/>
                </button>
              </div>
            </div>
            <div className="gallery-lightbox-image">
              <Image
                alt={selectedPhoto.alt || selectedPhoto.title}
                className="gallery-lightbox-full-image"
                height={selectedDimensions?.height || 800}
                onLoad={(event) => {
                  const { naturalWidth, naturalHeight } = event.currentTarget;
                  if (naturalWidth && naturalHeight) {
                    setImageDimensions((current) => ({
                      ...current,
                      [selectedPhoto.image!]: { width: naturalWidth, height: naturalHeight },
                    }));
                  }
                }}
                priority
                sizes="(max-width: 760px) 100vw, 1120px"
                src={selectedPhoto.image!}
                style={{ transform: `scale(${zoom})` }}
                width={selectedDimensions?.width || 1200}
              />
            </div>
            {visiblePhotos.length > 1 && (
              <div aria-label="Gallery navigation" className="gallery-lightbox-controls">
                <button aria-label="Previous photo" className="gallery-lightbox-nav" onClick={() => {
                  setZoom(1);
                  setSelectedIndex((index) => index === null ? null : (index - 1 + visiblePhotos.length) % visiblePhotos.length);
                }} type="button">
                  <Icon name="chevron-right" size={24} className="gallery-lightbox-previous-icon"/>
                </button>
                <button aria-label="Next photo" className="gallery-lightbox-nav" onClick={() => {
                  setZoom(1);
                  setSelectedIndex((index) => index === null ? null : (index + 1) % visiblePhotos.length);
                }} type="button">
                  <Icon name="chevron-right" size={24}/>
                </button>
              </div>
            )}
            <div className="gallery-lightbox-caption">
              <h2 id="gallery-lightbox-title">{selectedPhoto.description || selectedPhoto.title}</h2>
            </div>
          </div>
        </div>,
        portalRoot,
      )}
    </>
  );
}
