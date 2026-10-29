"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { Icon } from "@/components/icon";

type Props = {
  label: string;
  value: unknown;
  name?: unknown;
  mimeType?: unknown;
  path: string[];
  update: (path: string[], value: unknown) => void;
  onUpload: (file: File, path: string[]) => Promise<void>;
  nameKey?: string;
  mimeKey?: string;
};

export function CmsAttachmentField({
  label,
  value,
  name,
  mimeType,
  path,
  update,
  onUpload,
  nameKey = "attachmentName",
  mimeKey = "attachmentType",
}: Props) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const url = typeof value === "string" ? value : "";
  const fileName = typeof name === "string" ? name : "";
  const mime = typeof mimeType === "string" ? mimeType : "";
  const isImage = mime.startsWith("image/") && Boolean(url);

  async function choose(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      await onUpload(file, path);
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    update(path, "");
    const base = path.slice(0, -1);
    update([...base, nameKey], "");
    update([...base, mimeKey], "");
  }

  return (
    <div className="form-field cms-attachment-field">
      <label htmlFor={inputId}>{label}</label>
      {isImage && (
        <div className="cms-attachment-image-preview">
          <Image src={url} alt={fileName || `${label} preview`} width={900} height={520} unoptimized sizes="(max-width: 700px) 100vw, 600px" />
        </div>
      )}
      {url ? (
        <div className="cms-attachment-current">
          <span className="cms-attachment-kind-icon"><Icon name={isImage ? "image" : "file-text"} size={21}/></span>
          <span className="cms-attachment-current-copy"><strong>{fileName || (isImage ? "Uploaded image" : "Attached document")}</strong><small>{mime || "Attachment"}</small></span>
          <a className="button button-outline button-small" href={url} target="_blank" rel="noopener noreferrer"><Icon name="external-link" size={13}/> Preview</a>
          <button type="button" className="button button-danger button-small" onClick={clear} disabled={busy}><Icon name="trash" size={13}/> Remove</button>
        </div>
      ) : (
        <p className="cms-attachment-empty"><Icon name="paperclip" size={16}/>No file attached.</p>
      )}
      <div className="cms-attachment-upload-row">
        <input
          id={inputId}
          className="visually-hidden"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,application/pdf,.pdf"
          disabled={busy}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            void choose(file);
            event.currentTarget.value = "";
          }}
        />
        <label htmlFor={inputId} className={`button button-outline button-small ${busy ? "is-disabled" : ""}`}>
          <Icon name="upload" size={14}/>{busy ? "Uploading…" : url ? "Replace file" : "Upload image or PDF"}
        </label>
        <small className="form-note">JPG, PNG, WebP, AVIF or PDF. Maximum 12 MB. The file is stored in Cloudinary; save the page after attaching it.</small>
      </div>
    </div>
  );
}
