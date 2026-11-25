/**
 * Pixel comparison between the ORIGINAL site (index.html) and the NEW Next.js site.
 *
 * Both versions are opened with the same screen size, colour scheme and date,
 * with animations frozen (reduced motion). Screenshots of the full page and of
 * interactive states are compared; the share of differing pixels must stay
 * below a small threshold (the only expected differences come from photos being
 * re-encoded to lighter modern formats).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { compare, diffBands, fontReport, openVersion, settle, waitForScrollIdle } from "./harness";

const OUT = "test-results/visual";
const MAX_FULL_PAGE_DIFF = 0.005; // 0.5% of pixels
const MAX_STATE_DIFF = 0.01; // 1% of pixels

const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 820, height: 1180 },
  mobile: { width: 390, height: 844 },
} as const;

type Scenario = { name: string; act: (page: Page) => Promise<void> };

/** The same user actions, performed identically on both versions. */
const SCENARIOS: Scenario[] = [
  {
    name: "services-men",
    act: async (page) => {
      await page.locator("#svc-open").click();
      await page.locator("#svc-choose .choice").first().click();
    },
  },
  {
    name: "gallery-women",
    act: async (page) => {
      await page.locator("#werk-open").click();
      await page.locator('.filters button[data-f="women"]').click();
    },
  },
  {
    name: "lightbox",
    act: async (page) => {
      await page.locator("#werk-open").click();
      await page.locator(".tile").nth(1).click();
      await page
        .locator("#lbi")
        .evaluate((img: HTMLImageElement) =>
          img.complete ? null : new Promise((r) => img.addEventListener("load", r, { once: true })),
        );
    },
  },
  {
    name: "booking-confirmed",
    act: async (page) => {
      const book = page.locator("#book");
      await book.getByRole("button", { name: /Heren/ }).click();
      await book.getByRole("button", { name: /Yusuf/ }).click();
      await book.getByRole("button", { name: /Haar en baard/ }).click();
      await book.locator(".day").nth(2).click();
      await book.locator(".slot:not([disabled])").nth(3).click();
      await book.getByRole("button", { name: "Afspraak bevestigen" }).click();
    },
  },
  {
    name: "account-and-social-notes",
    act: async (page) => {
      await page.locator(".acct-link").first().click();
      await page.locator('.social a[data-k="tiktok"]').click();
    },
  },
];

async function shoot(page: Page, fullPage: boolean, clip?: "viewport") {
  return page.screenshot({ fullPage: clip ? false : fullPage, animations: "disabled" });
}

test.beforeAll(() => mkdirSync(OUT, { recursive: true }));

for (const [device, viewport] of Object.entries(VIEWPORTS)) {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`full page – ${device} – ${colorScheme}`, async ({ browser, baseURL }) => {
      const shots: Buffer[] = [];
      for (const version of ["original", "new"] as const) {
        const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
        const page = await context.newPage();
        await openVersion(page, version, { colorScheme, baseURL: baseURL! });
        if (device === "mobile" && colorScheme === "light")
          console.log(`fonts ${version}: ${await fontReport(page)}`);
        const png = await shoot(page, true);
        writeFileSync(`${OUT}/${device}-${colorScheme}-${version}.png`, png);
        shots.push(png);
        await context.close();
      }
      const result = compare(shots[0]!, shots[1]!);
      writeFileSync(`${OUT}/${device}-${colorScheme}-diff.png`, result.diffPng);
      console.log(`${device} ${colorScheme}: ${(result.ratio * 100).toFixed(3)}% different pixels`);
      console.log(`  where: ${diffBands(result.diffPng)}`);
      expect(result.heightB, "page height").toBe(result.heightA);
      expect(result.ratio).toBeLessThan(MAX_FULL_PAGE_DIFF);
    });
  }
}

for (const scenario of SCENARIOS) {
  for (const device of ["desktop", "mobile"] as const) {
    test(`state "${scenario.name}" – ${device}`, async ({ browser, baseURL }) => {
      const shots: Buffer[] = [];
      for (const version of ["original", "new"] as const) {
        const context = await browser.newContext({ viewport: VIEWPORTS[device], deviceScaleFactor: 1 });
        const page = await context.newPage();
        await openVersion(page, version, { colorScheme: "light", baseURL: baseURL! });
        await scenario.act(page);
        const lightbox = scenario.name === "lightbox";
        // The lightbox is photographed as it opens (scrolling behind an open overlay is not meaningful).
        if (lightbox) await waitForScrollIdle(page);
        else await settle(page);
        const png = await shoot(page, !lightbox, lightbox ? "viewport" : undefined);
        writeFileSync(`${OUT}/state-${scenario.name}-${device}-${version}.png`, png);
        shots.push(png);
        await context.close();
      }
      const result = compare(shots[0]!, shots[1]!);
      writeFileSync(`${OUT}/state-${scenario.name}-${device}-diff.png`, result.diffPng);
      console.log(`${scenario.name} ${device}: ${(result.ratio * 100).toFixed(3)}% different pixels`);
      expect(result.heightB, "page height").toBe(result.heightA);
      expect(result.ratio).toBeLessThan(MAX_STATE_DIFF);
    });
  }
}
