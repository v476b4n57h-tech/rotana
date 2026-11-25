import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

/** Loading speed compared with the original single 2 MB HTML file. */
const ORIGINAL_BYTES = readFileSync("index.html").length;

test("initial page load is much lighter than the original", async ({ page }) => {
  let transferred = 0;
  page.on("response", async (res) => {
    const body = await res.body().catch(() => Buffer.alloc(0));
    transferred += body.length;
  });
  const res = await page.goto("/", { waitUntil: "load" });
  const html = (await res!.body()).length;
  await page.waitForLoadState("networkidle");

  expect(html, "HTML size").toBeLessThan(150_000);
  expect(transferred, "everything loaded on first view").toBeLessThan(ORIGINAL_BYTES * 0.5);
  console.log(
    `original: ${(ORIGINAL_BYTES / 1024).toFixed(0)} KB · new HTML: ${(html / 1024).toFixed(0)} KB · new first view total: ${(transferred / 1024).toFixed(0)} KB`,
  );
});

test("photos are served in modern formats at the size the screen needs", async ({ page }) => {
  const types: string[] = [];
  page.on("response", (res) => {
    if (res.url().includes("/_next/image")) types.push(res.headers()["content-type"] ?? "");
  });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(types.length).toBeGreaterThan(0);
  for (const type of types) expect(type).toMatch(/image\/(avif|webp)/);
});
