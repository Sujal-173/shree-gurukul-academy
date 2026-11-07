import { describe, expect, it } from "vitest";
import { readBodyLimited, readTextBodyLimited } from "../lib/security";

describe("bounded request-body readers", () => {
  it("reads a body under the configured byte ceiling", async () => {
    const request = new Request("https://example.test/api", {
      method: "POST",
      body: JSON.stringify({ message: "hello" }),
    });

    await expect(readTextBodyLimited(request, 100)).resolves.toBe('{"message":"hello"}');
  });

  it("rejects a body that exceeds the byte ceiling", async () => {
    const request = new Request("https://example.test/api", {
      method: "POST",
      body: "x".repeat(129),
    });

    await expect(readBodyLimited(request, 128)).resolves.toBeNull();
  });

  it("treats a request without a body as an empty body", async () => {
    const request = new Request("https://example.test/api", { method: "POST" });
    await expect(readTextBodyLimited(request, 1)).resolves.toBe("");
  });
});
