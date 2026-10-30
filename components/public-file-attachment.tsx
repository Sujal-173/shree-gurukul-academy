import Image from "next/image";
import { Icon } from "@/components/icon";
import { isSupportedImageMime, isSupportedSchoolAttachmentMime } from "@/lib/upload-validation";

function isSafeAttachmentUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/\\")) return false;
  if (trimmed.startsWith("/")) return !/\.svg(?:[?#].*)?$/i.test(trimmed);
  try {
    const url = new URL(trimmed);
    return ["https:", "http:"].includes(url.protocol) && !/\.svg(?:[?#].*)?$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function seemsImage(url: string, mimeType?: string): boolean {
  if (mimeType?.trim()) return isSupportedImageMime(mimeType.trim());
  return /\.(?:avif|jpe?g|png|webp)(?:[?#].*)?$/i.test(url);
}

function canEmbedImage(url: string): boolean {
  if (url.startsWith("/")) return true;
  try { return new URL(url).protocol === "https:"; } catch { return false; }
}

export function PublicFileAttachment({
  url,
  name,
  mimeType,
  alt,
  label = "View attached file",
}: {
  url?: string;
  name?: string;
  mimeType?: string;
  alt?: string;
  label?: string;
}) {
  if (typeof url !== "string" || !isSafeAttachmentUrl(url)) return null;
  const normalizedMime = typeof mimeType === "string" ? mimeType.trim() : "";
  if (normalizedMime && !isSupportedSchoolAttachmentMime(normalizedMime)) return null;
  const image = seemsImage(url, normalizedMime) && canEmbedImage(url);
  const safeName = (typeof name === "string" ? name.trim() : "") || (image ? "Notice image" : "School document");
  const safeAlt = typeof alt === "string" ? alt.trim() : "";
  return <div className="public-file-attachment">
    {image && <a className="public-file-image" href={url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${safeName} in a new tab`}>
      <Image src={url} alt={safeAlt || safeName} width={1200} height={760} unoptimized sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 560px" />
    </a>}
    <a className="public-file-link" href={url} target="_blank" rel="noopener noreferrer" aria-label={`${label}: ${safeName}`}>
      <span className="public-file-icon"><Icon name={image ? "image" : "file-text"} size={17}/></span>
      <span><strong>{image ? `View ${safeName}` : safeName}</strong><small>{normalizedMime === "application/pdf" || /\.pdf(?:[?#].*)?$/i.test(url) ? "PDF document" : image ? "Image attachment" : "Open attachment"}</small></span>
      <Icon name="arrow-up-right" size={15}/>
    </a>
  </div>;
}
