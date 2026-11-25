import { expect, test } from "@playwright/test";

test("home page loads in Dutch with the ROTANA colours", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("ROTANA Hair Style");
  await expect(page.locator("html")).toHaveAttribute("lang", "nl");
  await expect(page.locator("h1")).toContainText("Knippen en verzorgen, voor");

  // Background colour of the original (--bg: #F6EEE1 = rgb(246, 238, 225)).
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(246, 238, 225)");
});

test("dark mode uses the original dark colours", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(27, 20, 16)"); // #1B1410
});

test("Cormorant Garamond and Jost are loaded", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const families = await page.evaluate(() =>
    [...document.fonts]
      .filter((f) => f.status === "loaded")
      .map((f) => f.family)
      .join("|"),
  );
  expect(families).toMatch(/Cormorant Garamond/);
  expect(families).toMatch(/Jost/);
});

test("security headers are set", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  expect(res.headers()["x-frame-options"]).toBe("DENY");
  expect(res.headers()["x-powered-by"]).toBeUndefined();
});
