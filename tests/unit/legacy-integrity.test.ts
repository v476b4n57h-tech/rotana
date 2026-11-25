import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Beschermt de originele website: index.html moet byte-voor-byte gelijk blijven
 * aan de versie in tag v0-static-demo. Faalt deze test, dan is het origineel gewijzigd.
 */
const ORIGINAL_SHA256 = "6e1cdd03cf3bd9353a6d343eeae3db83e864884129a575e3f9b09728f35955a3";

describe("originele website (v0-static-demo)", () => {
  it("index.html is ongewijzigd", () => {
    const hash = createHash("sha256").update(readFileSync("index.html")).digest("hex");
    expect(hash).toBe(ORIGINAL_SHA256);
  });
});
