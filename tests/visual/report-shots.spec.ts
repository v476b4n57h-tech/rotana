/**
 * Generates the screenshots used in the phase 1 report (docs/reports/phase-1).
 * Not part of the regular test run: `REPORT_SHOTS=1 npm run test:visual -- report-shots`.
 */
import { test, type Page } from "@playwright/test";
import sharp from "sharp";
import { openVersion, settle, waitForScrollIdle } from "./harness";

const DIR = "docs/reports/phase-1/screenshots";
test.skip(!process.env.REPORT_SHOTS, "only when generating report screenshots");

async function save(png: Buffer, name: string) {
  await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(`${DIR}/${name}.jpg`);
}

async function open(
  browser: import("@playwright/test").Browser,
  baseURL: string,
  w: number,
  h: number,
  scale: number,
  scheme: "light" | "dark" = "light",
) {
  const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  const page = await context.newPage();
  await openVersion(page, "new", { colorScheme: scheme, baseURL });
  return { context, page };
}

const views: [string, number, number][] = [
  ["desktop", 1280, 800],
  ["tablet", 820, 1180],
  ["mobile", 390, 844],
];

for (const [name, w, h] of views) {
  for (const scheme of ["light", "dark"] as const) {
    test(`top ${name} ${scheme}`, async ({ browser, baseURL }) => {
      const { context, page } = await open(browser, baseURL!, w, h, 2, scheme);
      await save(await page.screenshot(), `${name}-${scheme}`);
      await context.close();
    });
  }
  test(`full page ${name}`, async ({ browser, baseURL }) => {
    const { context, page } = await open(browser, baseURL!, w, h, 1);
    await save(await page.screenshot({ fullPage: true }), `${name}-full-page`);
    await context.close();
  });
}

const states: [string, (p: Page) => Promise<void>, string][] = [
  [
    "services",
    async (p) => {
      await p.locator("#svc-open").click();
      await p.locator('[data-svc="men"]').first().click();
    },
    "#diensten",
  ],
  [
    "gallery",
    async (p) => {
      await p.locator("#werk-open").click();
    },
    "#werk",
  ],
  [
    "booking",
    async (p) => {
      const b = p.locator("#book");
      await b.getByRole("button", { name: /Heren/ }).click();
      await b.getByRole("button", { name: /Yusuf/ }).click();
      await b.getByRole("button", { name: /Haar en baard/ }).click();
      await b.locator(".day").nth(2).click();
      await b.locator(".slot:not([disabled])").nth(3).click();
      await b.getByRole("button", { name: "Afspraak bevestigen" }).click();
    },
    "#afspraak",
  ],
  ["contact", async () => {}, "#contact"],
];

for (const [name, act, selector] of states) {
  test(`state ${name}`, async ({ browser, baseURL }) => {
    const { context, page } = await open(browser, baseURL!, 1280, 800, 2);
    await act(page);
    await settle(page);
    await save(await page.locator(selector).screenshot(), `state-${name}`);
    await context.close();
  });
}

test("state lightbox", async ({ browser, baseURL }) => {
  const { context, page } = await open(browser, baseURL!, 1280, 800, 2);
  await page.locator("#werk-open").click();
  await page.locator(".tile").nth(1).click();
  await page
    .locator("#lbi")
    .evaluate((img: HTMLImageElement) =>
      img.complete ? null : new Promise((r) => img.addEventListener("load", r, { once: true })),
    );
  await waitForScrollIdle(page);
  await save(await page.screenshot(), "state-lightbox");
  await context.close();
});

test("side by side: original vs new vs differences", async () => {
  const src = "test-results/visual";
  const crop = { left: 0, top: 0, width: 1280, height: 1800 };
  const [a, b, d] = await Promise.all(
    ["original", "new", "diff"].map((v) =>
      sharp(`${src}/desktop-light-${v}.png`).extract(crop).resize(640).toBuffer(),
    ),
  );
  await sharp({ create: { width: 1960, height: 900, channels: 3, background: "#ffffff" } })
    .composite([
      { input: a!, left: 0, top: 0 },
      { input: b!, left: 660, top: 0 },
      { input: d!, left: 1320, top: 0 },
    ])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(`${DIR}/compare-desktop-original-new-diff.jpg`);
});
