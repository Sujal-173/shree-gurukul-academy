import { afterEach, describe, expect, it } from "vitest";
import { getSiteUrl } from "../lib/site-url";

const initialSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  if (initialSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = initialSiteUrl;
  }
});

describe("canonical site URL", () => {
  it("does not invent a public origin when none is configured", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getSiteUrl()).toBeUndefined();
  });

  it("normalizes the configured URL to its origin", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://school.example/path?preview=1";
    expect(getSiteUrl()?.toString()).toBe("https://school.example/");
  });

  it("rejects unsupported protocols", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "javascript:alert(1)";
    expect(() => getSiteUrl()).toThrow("NEXT_PUBLIC_SITE_URL must use http or https.");
  });
});
