import { expect, test, type Page } from "@playwright/test";

/**
 * Single Active Panel: at most one interactive panel is open at any moment,
 * and the lightbox only ever sits on top of the gallery. These tests run on
 * desktop, tablet and mobile (see playwright.config.ts).
 */

async function openPanels(page: Page) {
  return page.evaluate(() => ({
    services: !!document.querySelector("#svc-panel.open"),
    gallery: !!document.querySelector("#werk-panel.open"),
    lightbox: !(document.getElementById("lb") as HTMLElement).hidden,
  }));
}

/** The core rule, checked after every action. */
async function expectSingleActive(page: Page) {
  const state = await openPanels(page);
  const open = [state.services, state.gallery].filter(Boolean).length;
  expect(open, `open panels: ${JSON.stringify(state)}`).toBeLessThanOrEqual(1);
  if (state.lightbox) expect(state.gallery, "lightbox only on top of the gallery").toBe(true);
  // Visually too: never two panels displayed at the same time.
  const visible = await page.locator("#svc-panel:visible, #werk-panel:visible").count();
  expect(visible).toBeLessThanOrEqual(1);
}

async function inViewport(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.top >= -2 && r.top < window.innerHeight;
  });
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" }); // instant transitions: assertions see final states
  await page.goto("/");
});

test("opening the gallery closes the services panel, and the other way round", async ({ page }) => {
  await page.locator("#svc-open").click();
  await expect(page.locator("#svc-panel")).toBeVisible();
  await expectSingleActive(page);

  await page.locator("#werk-open").click();
  await expect(page.locator("#werk-panel")).toBeVisible();
  await expect(page.locator("#svc-panel")).toBeHidden();
  await expect(page.locator("#svc-open")).toHaveText("Bekijk diensten en prijzen");
  await expect(page.locator("#svc-open")).toHaveAttribute("aria-expanded", "false");
  await expectSingleActive(page);

  await page.locator("#svc-open").click();
  await expect(page.locator("#svc-panel")).toBeVisible();
  await expect(page.locator("#werk-panel")).toBeHidden();
  await expectSingleActive(page);
});

test("the clicked button stays in place when a panel above it closes", async ({ page }) => {
  await page.locator("#svc-open").click();
  await page.locator('[data-svc="men"]').click(); // tall list above the gallery
  const button = page.locator("#werk-open");
  await button.scrollIntoViewIfNeeded();
  // Measure in the same state as the click: buttons lift 2px on hover (original design).
  await button.hover();
  const before = (await button.boundingBox())!.y;
  await button.click();
  await expect(page.locator("#svc-panel")).toBeHidden();
  const after = (await button.boundingBox())!.y;
  expect(Math.abs(after - before)).toBeLessThanOrEqual(1); // sub-pixel rounding only
});

test("menu link opens its panel, closes the other, scrolls and moves focus to it", async ({ page }) => {
  await page.locator("#svc-open").click();
  await page.locator('header a[data-panel="gallery"]').click();
  await expect(page.locator("#werk-panel")).toBeVisible();
  await expect(page.locator("#svc-panel")).toBeHidden();
  await expect(page.locator("#werk-panel")).toBeFocused();
  await expect.poll(() => inViewport(page, "#werk")).toBe(true);
  await expect(page).toHaveURL(/#werk$/);
  await expectSingleActive(page);
});

test("booking link closes open panels and focuses the booking step title", async ({ page }) => {
  await page.locator("#werk-open").click();
  await page.locator('header a[data-panel="booking"]').click();
  await expect(page.locator("#werk-panel")).toBeHidden();
  await expect(page.locator("#book-title")).toBeFocused();
  await expect.poll(() => inViewport(page, "#afspraak")).toBe(true);
  await expectSingleActive(page);
});

test("Escape closes the open panel and returns focus to its button", async ({ page }) => {
  await page.locator("#svc-open").click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#svc-panel")).toBeHidden();
  await expect(page.locator("#svc-open")).toBeFocused();
});

test("lightbox is a modal layer: page behind is locked, Escape closes one layer at a time", async ({
  page,
}) => {
  await page.locator("#werk-open").click();
  await page.locator(".tile").first().click();
  await expect(page.locator("#lb")).toBeVisible();
  await expectSingleActive(page);

  // The page behind cannot be reached or scrolled.
  expect(await page.locator("header").evaluate((el) => (el as HTMLElement).inert)).toBe(true);
  expect(await page.locator("#diensten").evaluate((el) => (el as HTMLElement).inert)).toBe(true);
  await expect(page.locator("body")).toHaveClass(/lb-open/);
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("#lb"))).toBe(true);
  }

  await page.keyboard.press("Escape"); // 1st: lightbox only
  await expect(page.locator("#lb")).toBeHidden();
  await expect(page.locator("#werk-panel")).toBeVisible();
  expect(await page.locator("header").evaluate((el) => (el as HTMLElement).inert)).toBe(false);

  await page.keyboard.press("Escape"); // 2nd: the gallery
  await expect(page.locator("#werk-panel")).toBeHidden();
});

test("stress: 30 random panel actions never leave two panels open", async ({ page, isMobile }) => {
  const actions: [string, (p: Page) => Promise<void>][] = [
    ["services button", (p) => p.locator("#svc-open").click()],
    ["gallery button", (p) => p.locator("#werk-open").click()],
    ["menu: services", (p) => p.locator('header a[data-panel="services"]').click()],
    ["menu: gallery", (p) => p.locator('header a[data-panel="gallery"]').click()],
    ["menu: booking", (p) => p.locator('header a[data-panel="booking"]').click()],
    ["hero: services", (p) => p.locator('.hero a[data-panel="services"]').click()],
    ["escape", (p) => p.keyboard.press("Escape")],
  ];
  // Deterministic pseudo-random sequence (same on every run, different per device).
  let seed = isMobile ? 7 : 13;
  const next = () => (seed = (seed * 1103515245 + 12345) % 2147483648);
  for (let i = 0; i < 30; i++) {
    const [name, act] = actions[next() % actions.length]!;
    await test.step(name, async () => {
      await act(page);
      await expectSingleActive(page);
    });
  }
});

test("closing plays a short exit animation, then the panel is hidden", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator("#svc-open").click();
  await expect(page.locator("#svc-panel")).toBeVisible();
  await page.locator("#svc-open").click();
  await expect(page.locator("#svc-panel")).toHaveClass(/closing/);
  await expect(page.locator("#svc-panel")).toHaveCSS("animation-name", "panel-out");
  await expect(page.locator("#svc-panel")).toBeHidden();
  await expect(page.locator("#svc-panel")).not.toHaveClass(/closing/);
});

test.describe("booking keeps the customer's choices", () => {
  async function fillUntilTime(page: Page) {
    const book = page.locator("#book");
    await book.getByRole("button", { name: /Heren/ }).click();
    await book.getByRole("button", { name: /Daan/ }).click();
    await book.getByRole("button", { name: /Baard trimmen/ }).click();
    await book.locator(".day").nth(2).click();
    await book.locator(".slot:not([disabled])").first().click();
  }

  test("going back to another barber keeps treatment and day", async ({ page }) => {
    const book = page.locator("#book");
    await fillUntilTime(page);
    await book.getByRole("button", { name: "Andere kapper" }).click();
    await expect(page.locator("#book-title")).toHaveText("Heren: kies je kapper");
    await expect(page.locator("#book-title")).toBeFocused();
    await expect(book.getByRole("button", { name: /Daan/ })).toHaveAttribute("aria-pressed", "true");
    await book.getByRole("button", { name: /Milan/ }).click();
    // Straight back to the time step, with the treatment and day still chosen.
    await expect(page.locator("#book-title")).toHaveText("Heren: kies een tijd");
    await expect(book.locator(".note b").first()).toHaveText("Baard trimmen");
    await expect(book.locator(".day").nth(2)).toHaveClass(/\bon\b/);
  });

  test("choices survive a page reload", async ({ page }) => {
    await fillUntilTime(page);
    const summary = await page.locator("#book .summary h3").textContent();
    await page.reload();
    await expect(page.locator("#book-title")).toHaveText("Heren: kies een tijd");
    await expect(page.locator("#book .summary h3")).toHaveText(summary!);
  });

  test("choices are kept while other panels open and close", async ({ page }) => {
    await fillUntilTime(page);
    const summary = await page.locator("#book .summary h3").textContent();
    await page.locator('header a[data-panel="services"]').click();
    await page.locator('header a[data-panel="gallery"]').click();
    await page.keyboard.press("Escape");
    await expect(page.locator("#book .summary h3")).toHaveText(summary!);
  });
});
