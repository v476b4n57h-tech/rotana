import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Checks that the colours, fonts and every CSS rule of the original website are
 * present VERBATIM in the new stylesheets.
 */
const legacy = readFileSync("index.html", "utf8");
const globals = readFileSync("src/app/globals.css", "utf8");
const site = readFileSync("src/app/site.css", "utf8");
const legacyCss = legacy.slice(legacy.indexOf("<style>") + 7, legacy.indexOf("</style>"));

function block(source: string, start: string, end: string): string {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from);
  if (from < 0 || to < 0) throw new Error(`Block not found: ${start}`);
  return source.slice(from, to + end.length);
}

describe("visual identity", () => {
  it("colour variables (light + dark) and base rules are identical to the original", () => {
    const original = block(
      legacy,
      ":root{",
      ":focus-visible{outline:3px solid var(--accent);outline-offset:2px}",
    );
    expect(globals).toContain(original);
  });

  it("all component styles (layout, motion, gallery, booking…) are identical to the original", () => {
    const original = block(
      legacyCss,
      ".wrap{max-width:1160px",
      ".demo-ok{border:1px solid var(--accent);background:var(--surface);padding:18px 22px}",
    );
    expect(site).toContain(original);
  });

  it("together, the new stylesheets contain every line of the original CSS", () => {
    const combined = globals + "\n" + site;
    const lines = legacyCss
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    expect(lines.length).toBeGreaterThan(150);
    for (const line of lines) expect(combined, line).toContain(line);
  });

  it("all 19 colours of the original are present", () => {
    const original = block(legacy, ":root{", "*{box-sizing:border-box}");
    const colors = new Set(original.match(/#[0-9A-Fa-f]{6}/g));
    expect(colors.size).toBe(19);
    for (const c of colors) expect(globals).toContain(c);
  });

  it("same font families and weights", () => {
    const layout = readFileSync("src/app/layout.tsx", "utf8");
    expect(legacy).toContain("family=Cormorant+Garamond:wght@500;600&family=Jost:wght@400;500");
    expect(layout).toMatch(/Cormorant_Garamond\(\{[\s\S]*weight: \["500", "600"\]/);
    expect(layout).toMatch(/Jost\(\{[\s\S]*weight: \["400", "500"\]/);
  });
});
