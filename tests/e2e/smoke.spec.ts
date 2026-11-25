import { expect, test } from "@playwright/test";

test("startpagina laadt in het Nederlands met de ROTANA-kleuren", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("ROTANA Hair Style");
  await expect(page.locator("html")).toHaveAttribute("lang", "nl");
  await expect(page.getByRole("heading", { name: "ROTANA" })).toBeVisible();

  // Achtergrondkleur uit het origineel (--bg: #F6EEE1 = rgb(246, 238, 225)).
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(246, 238, 225)");
});

test("donkere modus gebruikt de originele donkere kleuren", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(27, 20, 16)"); // #1B1410
});

test("lettertypen Cormorant Garamond en Jost zijn geladen", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const families = await page.evaluate(() => [...document.fonts].map((f) => f.family).join("|"));
  expect(families).toMatch(/Cormorant Garamond/);
  expect(families).toMatch(/Jost/);
});

test("beveiligingsheaders staan aan", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  expect(res.headers()["x-frame-options"]).toBe("DENY");
  expect(res.headers()["x-powered-by"]).toBeUndefined();
});
