export const supportedImageMimes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
export const supportedDocumentMime = "application/pdf";

export function isSupportedImageMime(mime: string): boolean {
  return supportedImageMimes.has(mime);
}

export function isSupportedSchoolAttachmentMime(mime: string): boolean {
  return isSupportedImageMime(mime) || mime === supportedDocumentMime;
}

export function matchesImageSignature(bytes: Uint8Array, mime: string): boolean {
  if (mime === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "image/png") return bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  if (mime === "image/webp") return bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (mime === "image/avif") {
    if (bytes.length < 16 || String.fromCharCode(...bytes.slice(4, 8)) !== "ftyp") return false;
    const majorBrand = String.fromCharCode(...bytes.slice(8, 12));
    if (majorBrand === "avif" || majorBrand === "avis") return true;
    // AVIF files may use an ISO-BMFF compatible major brand such as "mif1";
    // scan compatible-brand slots (starting after the major brand + minor version).
    for (let offset = 16; offset + 4 <= Math.min(bytes.length, 128); offset += 4) {
      const brand = String.fromCharCode(...bytes.slice(offset, offset + 4));
      if (brand === "avif" || brand === "avis") return true;
    }
    return false;
  }
  return false;
}

export function matchesSchoolAttachmentSignature(bytes: Uint8Array, mime: string): boolean {
  if (isSupportedImageMime(mime)) return matchesImageSignature(bytes, mime);
  return mime === supportedDocumentMime && bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
}
