import { describe, expect, it } from "vitest";
import {
  isSupportedImageMime,
  isSupportedSchoolAttachmentMime,
  matchesImageSignature,
  matchesSchoolAttachmentSignature,
} from "../lib/upload-validation";

describe("school notice upload validation", () => {
  it("allows only supported image formats and PDF attachments", () => {
    expect(isSupportedImageMime("image/jpeg")).toBe(true);
    expect(isSupportedImageMime("image/png")).toBe(true);
    expect(isSupportedImageMime("image/svg+xml")).toBe(false);
    expect(isSupportedSchoolAttachmentMime("application/pdf")).toBe(true);
    expect(isSupportedSchoolAttachmentMime("image/avif")).toBe(true);
    expect(isSupportedSchoolAttachmentMime("image/svg+xml")).toBe(false);
    expect(isSupportedSchoolAttachmentMime("text/html")).toBe(false);
  });

  it("checks file signatures rather than trusting the browser MIME value", () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0x00]);
    const pdf = new TextEncoder().encode("%PDF-1.7");
    const htmlDisguisedAsPdf = new TextEncoder().encode("<html>");
    expect(matchesImageSignature(jpeg, "image/jpeg")).toBe(true);
    expect(matchesSchoolAttachmentSignature(pdf, "application/pdf")).toBe(true);
    expect(matchesSchoolAttachmentSignature(htmlDisguisedAsPdf, "application/pdf")).toBe(false);
    expect(matchesSchoolAttachmentSignature(jpeg, "image/png")).toBe(false);
  });

  it("recognizes AVIF files with a compatible brand while rejecting spoofed containers", () => {
    const compatibleAvif = new Uint8Array(24);
    compatibleAvif.set(new TextEncoder().encode("\u0000\u0000\u0000\u0018ftypmif1\u0000\u0000\u0000\u0000avif"));
    expect(matchesImageSignature(compatibleAvif, "image/avif")).toBe(true);
    expect(matchesImageSignature(new TextEncoder().encode("not an avif"), "image/avif")).toBe(false);
  });
});
