import { expect, test, type Page } from "@playwright/test";

/** Behaviour of the new site: every interactive part of the original must work the same way. */

const errors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const list: string[] = [];
  errors.set(page, list);
  page.on("pageerror", (e) => list.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" || /hydrat/i.test(m.text())) list.push(m.text());
  });
});

test.afterEach(async ({ page }) => {
  expect(errors.get(page), "no errors in the browser console").toEqual([]);
});

test("all sections are present, in the original order", async ({ page }) => {
  await page.goto("/");
  const ids = await page.evaluate(() =>
    [...document.querySelectorAll("main > section, main > div")].map((el) => el.id || el.className),
  );
  expect(ids).toEqual([
    "",
    "ticker",
    "sfeer",
    "over-ons",
    "diensten",
    "werk",
    "lb",
    "afspraak",
    "account",
    "contact",
  ]);
});

test("no horizontal scrolling at this screen size", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("services panel: open, choose men/women, go back, close", async ({ page }) => {
  await page.goto("/");
  const panel = page.locator("#svc-panel");
  await expect(panel).toBeHidden();
  await page.locator("#svc-open").click();
  await expect(panel).toBeVisible();
  await expect(page.locator("#svc-open")).toHaveText("Sluiten");
  await page.locator('#svc-choose [data-svc="men"]').click();
  await expect(page.locator("#svc-men .svc")).toHaveCount(8);
  await expect(page.locator("#svc-choose")).toBeHidden();
  await page.locator('#svc-men [data-svc="back"]').click();
  await page.locator('#svc-choose [data-svc="women"]').click();
  await expect(page.locator("#svc-women .svc")).toHaveCount(6);
  await page.locator("#svc-open").click();
  await expect(panel).toBeHidden();
});

test("hero link 'Diensten en prijzen' opens the services panel", async ({ page }) => {
  await page.goto("/");
  await page.locator(".hero a[data-opensvc]").click();
  await expect(page.locator("#svc-panel")).toBeVisible();
  await expect(page).toHaveURL(/#diensten$/);
});

test("gallery: open, filter, lightbox with keyboard and focus return", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#werk-panel")).toBeHidden();
  await page.locator("#werk-open").click();
  await expect(page.locator(".tile:visible")).toHaveCount(10);
  await page.locator('.filters [data-f="women"]').click();
  await expect(page.locator(".tile:visible")).toHaveCount(3);
  await page.locator('.filters [data-f="men"]').click();
  await expect(page.locator(".tile:visible")).toHaveCount(7);

  const firstTile = page.locator(".tile:visible").first();
  await firstTile.click();
  await expect(page.locator("#lb")).toBeVisible();
  await expect(page.locator("#lbc")).toHaveText("Barbier en verzorging met warm doekje  (1/7)");
  await expect(page.locator("#lbx")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#lbc")).toContainText("(2/7)");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("#lbc")).toContainText("(7/7)");
  await page.keyboard.press("Escape");
  await expect(page.locator("#lb")).toBeHidden();
  await expect(firstTile).toBeFocused();
});

test("menu link 'Ons werk' opens the gallery", async ({ page, isMobile }) => {
  test.skip(!!isMobile, "same link; covered on desktop and tablet");
  await page.goto("/");
  await page.locator('nav a[href="#werk"]').click();
  await expect(page.locator("#werk-panel")).toBeVisible();
});

test("booking demo: full flow up to the demo confirmation", async ({ page }) => {
  await page.goto("/");
  const book = page.locator("#book");
  const title = page.locator("#book-title");
  await expect(title).toHaveText("Voor wie is de afspraak?");
  await book.getByRole("button", { name: /Dames/ }).click();
  await expect(title).toHaveText("Dames: kies je kapper");
  await expect(book.locator(".person")).toHaveCount(2);
  await book.getByRole("button", { name: /Lotte/ }).click();
  await expect(title).toHaveText("Dames: kies je behandeling");
  await book.getByRole("button", { name: /Highlights/ }).click();
  await expect(title).toHaveText("Dames: kies een tijd");
  await expect(book.locator(".day")).toHaveCount(7);
  await expect(book.locator(".slot")).toHaveCount(20);
  await expect(book.locator(".slot[disabled]").first()).toBeVisible();
  await book.locator(".slot:not([disabled])").first().click();
  await expect(book.locator(".summary h3")).toContainText("Highlights · Dames · Lotte");
  await book.getByRole("button", { name: "Afspraak bevestigen" }).click();
  await expect(book.locator(".demo-ok")).toContainText("Dit is een demo");
  await book.getByRole("button", { name: "Andere kapper" }).click();
  await expect(title).toHaveText("Dames: kies je kapper");
});

test("account and social links show the demo messages", async ({ page }) => {
  await page.goto("/");
  await page.locator(".acct-link").first().click();
  await expect(page.locator("#acct-note")).toContainText(
    "Dit is een demo: de link naar het boekingssysteem volgt.",
  );
  await page.locator('.social a[data-k="instagram"]').click();
  await expect(page.locator("#social-note")).toHaveText("Dit is een demo: de link naar Instagram volgt.");
  await expect(page.locator(".social svg")).toHaveCount(4);
});

test("motion: rotating word, photo slider and scroll reveal work", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  const word = page.locator("#rot");
  await expect(word).toHaveText("hem en haar");
  await page.clock.runFor(3500);
  await expect(word).toHaveText("hem");
  await expect(word).toHaveAttribute("aria-live", "off");

  const firstFrame = page.locator(".frame").first();
  await expect(firstFrame.locator(".pic").first()).toHaveClass(/on/);
  await page.clock.runFor(5000);
  await expect(firstFrame.locator(".pic").nth(1)).toHaveClass(/on/);

  // Sections below the fold fade in when scrolled into view.
  const contact = page.locator("#contact .reveal");
  await expect(contact).not.toHaveClass(/\bin\b/);
  await contact.scrollIntoViewIfNeeded();
  await expect(contact).toHaveClass(/\bin\b/);
  await expect(page.locator(".ticker .track")).toHaveCSS("animation-name", "tick");
});

test("slider dots switch photos", async ({ page }) => {
  await page.goto("/");
  const panel = page.locator(".panel").nth(1);
  await panel.locator(".dots button").nth(2).click();
  await expect(panel.locator(".pic").nth(2)).toHaveClass(/on/);
  await expect(panel.locator(".dots button").nth(2)).toHaveAttribute("aria-pressed", "true");
});

test("reduced motion: animations stop and all content is visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#contact .reveal")).toHaveCSS("opacity", "1");
  await expect(page.locator(".hero img")).toHaveCSS("animation-name", "none");
});

test("without JavaScript all content stays visible", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("#contact h2")).toBeVisible();
  await expect(page.locator("#svc-choose")).toBeVisible();
  await context.close();
});
