import { describe, expect, it } from "vitest";
import { safeImageSrc, sanitizeContent } from "../lib/sanitize-content";

describe("public image and attachment sanitization", () => {
  it("does not substitute a random classroom image for an invalid notice poster", () => {
    expect(safeImageSrc("javascript:alert(1)", "")).toBe("");
    const content = sanitizeContent({
      pages: {
        notices: {
          notices: [{
            id: "unsafe-notice",
            title: "Notice",
            description: "Read the circular.",
            imageUrl: "javascript:alert(1)",
            attachmentUrl: "javascript:alert(1)",
            active: true,
          }],
        },
      },
    });
    expect(content.pages.notices.notices[0].imageUrl).toBe("");
    expect(content.pages.notices.notices[0].attachmentUrl).toBe("");
  });

  it("keeps approved local and Cloudinary images but rejects SVG image delivery", () => {
    expect(safeImageSrc("/images/notice.webp", "")).toBe("/images/notice.webp");
    expect(safeImageSrc("https://res.cloudinary.com/school/image/upload/notice.webp", "")).toBe("https://res.cloudinary.com/school/image/upload/notice.webp");
    expect(safeImageSrc("https://res.cloudinary.com/school/image/upload/notice.svg", "")).toBe("");
    expect(safeImageSrc("/images/notice.svg", "")).toBe("");
  });
});
