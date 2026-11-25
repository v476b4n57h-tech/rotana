/**
 * Shared helpers to render the ORIGINAL site (index.html) and the NEW site under
 * identical conditions, so their screenshots can be compared pixel by pixel.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

export type Version = "original" | "new";

const ROOT = process.cwd();
const FA_CDN = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/";
const FA_LOCAL = path.join(ROOT, "node_modules/@fortawesome/fontawesome-free/");

/** Fixed date so the booking demo shows the same days in both versions. */
export const FIXED_NOW = new Date("2026-11-25T10:00:00");

export async function openVersion(
  page: Page,
  version: Version,
  opts: { colorScheme: "light" | "dark"; baseURL: string },
) {
  // The original loads Font Awesome 6.4.0 from a CDN; serve the identical files locally
  // so the test does not depend on that CDN being reachable.
  await page.route(`${FA_CDN}**`, (route) => {
    const rel = route.request().url().slice(FA_CDN.length);
    const type = rel.endsWith(".css") ? "text/css" : rel.endsWith(".woff2") ? "font/woff2" : "font/ttf";
    return route.fulfill({ body: readFileSync(path.join(FA_LOCAL, rel)), contentType: type });
  });
  if (version === "original") await serveSameFontFiles(page, opts.baseURL);
  await page.clock.setFixedTime(FIXED_NOW);
  // Reduced motion freezes the animations (both versions respect it), giving stable screenshots.
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: opts.colorScheme });
  const url = version === "original" ? `file://${path.join(ROOT, "index.html")}` : opts.baseURL;
  await page.goto(url, { waitUntil: "load" });
  await settle(page);
}

/**
 * Google Fonts serves the latest version of each font file, which changes over
 * time and can differ between machines. The new site self-hosts a fixed copy.
 * To compare the implementation (not Google's font updates), the original page
 * gets the very same font files as the new site: same families, weights and
 * unicode ranges, only served from the build output.
 */
const FONT_HOST = "https://fonts.gstatic.com/__rotana__/";
let fontCss: string | undefined;

async function serveSameFontFiles(page: Page, baseURL: string) {
  if (!fontCss) {
    const html = await (await fetch(baseURL)).text();
    const faces = html.match(/@font-face\{[^}]*\}/g) ?? [];
    fontCss = faces
      .filter((f) => /font-family:"?(Cormorant Garamond|Jost)"?;/.test(f))
      .map((f) => f.replace(/url\(\/_next\/static\/media\//g, `url(${FONT_HOST}`))
      .join("\n");
    if (!fontCss) throw new Error("No @font-face rules found in the new site");
  }
  await page.route("https://fonts.googleapis.com/css2**", (route) =>
    route.fulfill({ body: fontCss!, contentType: "text/css" }),
  );
  await page.route(`${FONT_HOST}**`, (route) => {
    const file = route.request().url().slice(FONT_HOST.length);
    return route.fulfill({
      body: readFileSync(path.join(ROOT, ".next/static/media", file)),
      contentType: "font/woff2",
      headers: { "access-control-allow-origin": "*" },
    });
  });
}

/** Wait for fonts, then scroll through the page so lazy images load, then back to the top. */
export async function settle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const step = window.innerHeight / 2;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
    window.scrollTo(0, 0);
    // Only visible images are loaded by the browser (images in closed panels stay lazy).
    const pending = [...document.images].filter((img) => !img.complete && img.getClientRects().length > 0);
    await Promise.race([
      Promise.all(pending.map((img) => new Promise((r) => img.addEventListener("load", r, { once: true })))),
      new Promise((r) => setTimeout(r, 5000)),
    ]);
  });
  await page.waitForTimeout(200);
}

export interface DiffResult {
  width: number;
  heightA: number;
  heightB: number;
  differentPixels: number;
  ratio: number;
  diffPng: Buffer;
}

/** Compares two PNG screenshots. Height differences count as fully different rows. */
export function compare(a: Buffer, b: Buffer): DiffResult {
  const imgA = PNG.sync.read(a);
  const imgB = PNG.sync.read(b);
  const width = Math.min(imgA.width, imgB.width);
  const height = Math.min(imgA.height, imgB.height);
  const crop = (img: PNG) => {
    const out = new PNG({ width, height });
    PNG.bitblt(img, out, 0, 0, width, height, 0, 0);
    return out;
  };
  const diff = new PNG({ width, height });
  const differing = pixelmatch(crop(imgA).data, crop(imgB).data, diff.data, width, height, {
    threshold: 0.1,
  });
  const extraRows = Math.abs(imgA.height - imgB.height) * width;
  const total = width * Math.max(imgA.height, imgB.height);
  return {
    width,
    heightA: imgA.height,
    heightB: imgB.height,
    differentPixels: differing + extraRows,
    ratio: (differing + extraRows) / total,
    diffPng: PNG.sync.write(diff),
  };
}

/** Waits until the page has stopped (smooth-)scrolling. */
export async function waitForScrollIdle(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let last = -1;
        let stable = 0;
        const tick = () => {
          stable = window.scrollY === last ? stable + 1 : 0;
          last = window.scrollY;
          if (stable >= 10) resolve();
          else requestAnimationFrame(tick);
        };
        tick();
      }),
  );
}

/** Diagnostics: which font files a page loaded (helps explain rendering differences). */
export async function fontReport(page: Page): Promise<string> {
  return page.evaluate(() => {
    const faces = [...document.fonts]
      .filter((f) => f.status === "loaded")
      .map((f) => `${f.family} ${f.weight}`)
      .sort();
    const files = performance
      .getEntriesByType("resource")
      .map((e) => e.name)
      .filter((n) => /\.(woff2?|ttf)(\?|$)/.test(n))
      .map((n) => n.split("/").pop());
    return `faces=[${[...new Set(faces)].join(", ")}] files=[${files.join(", ")}]`;
  });
}

/** Diagnostics: the horizontal bands of the page where differing pixels are concentrated. */
export function diffBands(diffPng: Buffer, top = 6): string {
  const img = PNG.sync.read(diffPng);
  const rows: number[] = [];
  for (let y = 0; y < img.height; y++) {
    let count = 0;
    for (let x = 0; x < img.width; x++) {
      const i = (y * img.width + x) * 4;
      if (img.data[i] === 255 && img.data[i + 1] === 0 && img.data[i + 2] === 0) count++;
    }
    rows.push(count);
  }
  const bands: { from: number; to: number; px: number }[] = [];
  for (let y = 0; y < rows.length; y += 50) {
    const px = rows.slice(y, y + 50).reduce((a, b) => a + b, 0);
    if (px) bands.push({ from: y, to: Math.min(y + 49, rows.length - 1), px });
  }
  return bands
    .sort((a, b) => b.px - a.px)
    .slice(0, top)
    .map((b) => `y${b.from}-${b.to}:${b.px}px`)
    .join(" ");
}
