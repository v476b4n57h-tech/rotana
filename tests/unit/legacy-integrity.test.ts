import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Protects the original website: index.html must stay byte-for-byte identical to
 * the version in tag v0-static-demo. If this fails, the original was modified.
 */
const ORIGINAL_SHA256 = "6e1cdd03cf3bd9353a6d343eeae3db83e864884129a575e3f9b09728f35955a3";

describe("original website (v0-static-demo)", () => {
  it("index.html is unchanged", () => {
    const hash = createHash("sha256").update(readFileSync("index.html")).digest("hex");
    expect(hash).toBe(ORIGINAL_SHA256);
  });
});
