"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { Icon } from "@/components/icon";

type MediaItem = {
  _id?: string;
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  originalName?: string;
};

type Props = {
  label: string;
  value: unknown;
  path: string[];
  media: MediaItem[];
  update: (path: string[], value: unknown) => void;
  onUpload: (file: File, path: string[]) => Promise<void>;
};

export function CmsImageField({
  label,
  value,
  path,
  media,
  update,
  onUpload,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const inputId = useId();
  const fileId = useId();
  const current = typeof value === "string" ? value : "";

  async function handleUpload(file?: File) {
    if (!file) return;
    setUploadBusy(true);
    try {
      await onUpload(file, path);
    } finally {
      setUploadBusy(false);
    }
  }

  return (
    <div className="form-field cms-image-field">
      <label htmlFor={inputId}>{label}</label>
      <div className="cms-image-field-row">
        <div
          className="cms-image-current"
          aria-label={current ? `${label} preview` : `${label} has no image`}
        >
          {current &&
          (current.startsWith("/images/") ||
            current.startsWith("https://res.cloudinary.com/")) ? (
            <Image src={current} alt="" fill sizes="92px" unoptimized />
          ) : (
            <Icon name="image" size={24} />
          )}
        </div>
        <div className="cms-image-field-controls">
          <input
            id={inputId}
            value={current}
            onChange={(event) => update(path, event.target.value)}
            placeholder="Select an image or paste a URL"
            autoComplete="off"
          />
          <div className="cms-image-actions">
            <button
              type="button"
              className="button button-outline button-small"
              onClick={() => setPickerOpen((open) => !open)}
              aria-expanded={pickerOpen}
            >
              <Icon name="images" size={14} />{" "}
              {pickerOpen ? "Close library" : "Choose image"}
            </button>
            <label
              className={`button button-outline button-small ${uploadBusy ? "is-disabled" : ""}`}
              htmlFor={fileId}
            >
              <Icon name="upload" size={14} />{" "}
              {uploadBusy ? "Uploading…" : "Upload new"}
            </label>
            <input
              id={fileId}
              className="visually-hidden"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={uploadBusy}
              onChange={(event) => {
                const selected = event.target.files?.[0];
                void handleUpload(selected);
                event.currentTarget.value = "";
              }}
            />
          </div>
        </div>
      </div>
      {pickerOpen && (
        <div
          className="cms-image-picker"
          role="group"
          aria-label={`Choose ${label}`}
        >
          {media.length ? (
            media.map((item) => (
              <button
                type="button"
                key={item._id || item.publicId || item.url}
                className={`cms-image-choice ${item.url === current ? "selected" : ""}`}
                onClick={() => {
                  update(path, item.url);
                  setPickerOpen(false);
                }}
                title={item.originalName || item.publicId || item.url}
              >
                <span className="cms-image-choice-preview">
                  <Image src={item.url} alt="" fill sizes="96px" unoptimized />
                </span>
                <span>
                  {(
                    item.originalName ||
                    item.publicId ||
                    "Uploaded image"
                  ).slice(0, 34)}
                </span>
                {item.url === current && <Icon name="check-circle" size={14} />}
              </button>
            ))
          ) : (
            <p className="cms-image-picker-empty">
              No uploaded images yet. Use “Upload new” to add one.
            </p>
          )}
        </div>
      )}
      <small className="form-note">
        Use a Cloudinary media item or a local asset path such as
        /images/campus-illustration.webp.
      </small>
    </div>
  );
}
