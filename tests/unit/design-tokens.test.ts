import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Controleert dat de kleuren, lettertypen en basisregels van het origineel
 * letterlijk in de nieuwe globals.css staan.
 */
const legacy = readFileSync("index.html", "utf8");
const globals = readFileSync("src/app/globals.css", "utf8");

function block(source: string, start: string, end: string): string {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from);
  if (from < 0 || to < 0) throw new Error(`Blok niet gevonden: ${start}`);
  return source.slice(from, to + end.length);
}

describe("visuele identiteit", () => {
  it("kleurvariabelen (licht + donker) en basisregels zijn identiek aan het origineel", () => {
    const original = block(
      legacy,
      ":root{",
      ":focus-visible{outline:3px solid var(--accent);outline-offset:2px}",
    );
    expect(globals).toContain(original);
  });

  it("alle kleurwaarden uit het origineel komen voor", () => {
    const original = block(legacy, ":root{", "*{box-sizing:border-box}");
    const colors = new Set(original.match(/#[0-9A-Fa-f]{6}/g));
    expect(colors.size).toBe(19); // 19 verschillende kleuren in het origineel
    for (const c of colors) expect(globals).toContain(c);
  });

  it("dezelfde lettertypen en gewichten", () => {
    const layout = readFileSync("src/app/layout.tsx", "utf8");
    expect(legacy).toContain("family=Cormorant+Garamond:wght@500;600&family=Jost:wght@400;500");
    expect(layout).toMatch(/Cormorant_Garamond\(\{[\s\S]*weight: \["500", "600"\]/);
    expect(layout).toMatch(/Jost\(\{[\s\S]*weight: \["400", "500"\]/);
  });
});
