"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { CalendarPlanner } from "@/lib/types";
import { Icon } from "@/components/icon";

const subscribeToPortalRoot = () => () => {};
const getPortalRoot = () => document.body;
const getServerPortalRoot = () => null;

export function CalendarPlannerExplorer({
  items,
  emptyText,
}: {
  items: CalendarPlanner[];
  emptyText: string;
}) {
  const planners = items.filter((item) => item.active && item.image.trim());
  const [activeIndex, setActiveIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerZoom, setViewerZoom] = useState(1);
  const [viewerImageDimensions, setViewerImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [viewerBounds, setViewerBounds] = useState({ width: 0, height: 0 });
  const portalRoot = useSyncExternalStore(
    subscribeToPortalRoot,
    getPortalRoot,
    getServerPortalRoot,
  );
  const [previewHeight, setPreviewHeight] = useState<number | null>(null);
  const previewButtonRef = useRef<HTMLButtonElement | null>(null);
  const previewImageRef = useRef<HTMLImageElement | null>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const activePlanner = planners[activeIndex];
  const viewerImageRatio = viewerImageDimensions
    ? viewerImageDimensions.width / viewerImageDimensions.height
    : 0;
  const viewerImageWidth = viewerImageRatio && viewerBounds.width && viewerBounds.height
    ? Math.min(viewerBounds.width, viewerBounds.height * viewerImageRatio) * viewerZoom
    : 0;
  const viewerImageHeight = viewerImageRatio ? viewerImageWidth / viewerImageRatio : 0;

  const updatePreviewHeight = useCallback((image: HTMLImageElement) => {
    const button = previewButtonRef.current;
    if (!button || !image.naturalWidth || !image.naturalHeight) return;
    const ratio = image.naturalWidth / image.naturalHeight;
    const maxHeight = Math.min(window.innerHeight * 0.72, 760);
    setPreviewHeight(Math.min(button.clientWidth / ratio, maxHeight));
  }, []);

  useEffect(() => {
    const image = previewImageRef.current;
    if (image?.complete) updatePreviewHeight(image);
    function handleResize() {
      if (image?.complete) updatePreviewHeight(image);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activePlanner?.image, updatePreviewHeight]);

  useEffect(() => {
    if (!isViewerOpen || !portalRoot) return;
    const previousOverflow = document.body.style.overflow;
    function updateViewerBounds() {
      const isMobile = window.innerWidth <= 760;
      setViewerBounds({
        width: Math.min(window.innerWidth - (isMobile ? 36 : 144), 1120),
        height: Math.min(window.innerHeight * (isMobile ? 0.68 : 0.75), isMobile ? 650 : window.innerHeight),
      });
    }
    updateViewerBounds();
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsViewerOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updateViewerBounds);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updateViewerBounds);
      triggerButtonRef.current?.focus();
    };
  }, [isViewerOpen, portalRoot]);

  return (
    <>
      {planners.length > 0 && (
        <div className="calendar-planner-tabs" role="tablist" aria-label="Academic planner">
          {planners.map((planner, index) => (
            <button
              aria-selected={activeIndex === index}
              aria-controls="calendar-planner-panel"
              className={`calendar-planner-tab${activeIndex === index ? " is-active" : ""}`}
              id={`calendar-planner-tab-${index}`}
              key={`${planner.category}-${index}`}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(event) => {
                if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                event.preventDefault();
                const direction = event.key === "ArrowRight" ? 1 : -1;
                const nextIndex = (index + direction + planners.length) % planners.length;
                setActiveIndex(nextIndex);
                document.getElementById(`calendar-planner-tab-${nextIndex}`)?.focus();
              }}
              role="tab"
              tabIndex={activeIndex === index ? 0 : -1}
              type="button"
            >
              {planner.category || planner.title}
            </button>
          ))}
        </div>
      )}

      {activePlanner ? (
        <div
          aria-labelledby={`calendar-planner-tab-${activeIndex}`}
          className="calendar-planner-preview"
          id="calendar-planner-panel"
          role="tabpanel"
        >
          <button
            aria-label={`Open ${activePlanner.title || activePlanner.category} in full size`}
            className="calendar-planner-image-button"
            ref={previewButtonRef}
            style={previewHeight ? { height: `${previewHeight}px` } : undefined}
            onClick={(event) => {
              triggerButtonRef.current = event.currentTarget;
              setViewerZoom(1);
              const image = previewImageRef.current;
              if (image?.naturalWidth && image.naturalHeight) {
                setViewerImageDimensions({ width: image.naturalWidth, height: image.naturalHeight });
              }
              setIsViewerOpen(true);
            }}
            type="button"
          >
            <Image
              alt={activePlanner.alt || activePlanner.title || activePlanner.category}
              className="calendar-planner-image"
              fill
              ref={previewImageRef}
              onLoad={(event) => {
                const image = event.currentTarget;
                updatePreviewHeight(image);
                setViewerImageDimensions({ width: image.naturalWidth, height: image.naturalHeight });
              }}
              priority
              sizes="(max-width: 760px) 90vw, 650px"
              src={activePlanner.image}
            />
            <span className="calendar-planner-zoom"><Icon name="external-link" size={15}/> View full size</span>
          </button>
        </div>
      ) : (
        <div className="calendar-planner-empty">
          <Icon name="calendar-days" size={30}/>
          <p>{emptyText}</p>
        </div>
      )}

      {isViewerOpen && activePlanner && portalRoot && createPortal(
        <div
          className="gallery-lightbox calendar-planner-viewer"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsViewerOpen(false);
          }}
          role="presentation"
        >
          <div aria-label={activePlanner.title || activePlanner.category} aria-modal="true" className="gallery-lightbox-dialog" role="dialog">
            <div className="gallery-lightbox-toolbar calendar-planner-viewer-toolbar">
              <div aria-label="Image zoom controls" className="calendar-planner-zoom-controls">
                <button
                  aria-label="Zoom out"
                  disabled={viewerZoom <= 1}
                  onClick={() => setViewerZoom((zoom) => Math.max(1, zoom - 0.5))}
                  type="button"
                >
                  <span aria-hidden="true">−</span>
                </button>
                <span aria-live="polite">{Math.round(viewerZoom * 100)}%</span>
                <button
                  aria-label="Zoom in"
                  disabled={viewerZoom >= 3}
                  onClick={() => setViewerZoom((zoom) => Math.min(3, zoom + 0.5))}
                  type="button"
                >
                  <Icon name="plus" size={16}/>
                </button>
              </div>
              <strong>{activePlanner.title || activePlanner.category}</strong>
            </div>
            <div className="gallery-lightbox-image calendar-planner-image-scroll">
              {viewerImageWidth > 0 && viewerImageHeight > 0 && (
                <div
                  className="calendar-planner-image-scroll-inner"
                  style={{ width: `${viewerImageWidth}px`, height: `${viewerImageHeight}px` }}
                >
                  <Image
                    alt={activePlanner.alt || activePlanner.title || activePlanner.category}
                    fill
                    onLoad={(event) => setViewerImageDimensions({
                      width: event.currentTarget.naturalWidth,
                      height: event.currentTarget.naturalHeight,
                    })}
                    priority
                    sizes="100vw"
                    src={activePlanner.image}
                  />
                </div>
              )}
            </div>
            <div className="gallery-lightbox-caption calendar-planner-viewer-caption">
              <span>{activePlanner.category}</span>
              <h2>{activePlanner.title || activePlanner.category}</h2>
            </div>
          </div>
          <button
            aria-label="Close planner preview"
            className="calendar-planner-lightbox-close"
            onClick={() => setIsViewerOpen(false)}
            ref={closeButtonRef}
            type="button"
          >
            <Icon name="close" size={21}/>
            <span>Close</span>
          </button>
          </div>,
          portalRoot,
      )}
    </>
  );
}
