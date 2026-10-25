import { test, expect } from "@playwright/test";

// Homepage mounts the full-screen 3D intro on every fresh visit (by design,
// see e2e/public-security.spec.ts's intro-replay regression test) — it
// captures pointer events until dismissed. Emulating reduced-motion makes
// it auto-skip after ~1.5s without ever mounting the WebGL canvas, so tests
// that need to click something on the homepage do that first.
test.use({ reducedMotion: "reduce" });

test.describe("Language default + legal pages", () => {
  test("German is the default language on first visit", async ({ page }) => {
    await page.goto("/");
    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang).toBe("de");
  });

  test("footer has Impressum and Datenschutz links, both resolve", async ({ page }) => {
    await page.goto("/");
    const impressumLink = page.locator('footer a[href="/impressum"]');
    const datenschutzLink = page.locator('footer a[href="/datenschutz"]');
    await expect(impressumLink).toBeVisible();
    await expect(datenschutzLink).toBeVisible();

    const res1 = await page.request.get("/impressum");
    expect(res1.status()).toBe(200);
    const res2 = await page.request.get("/datenschutz");
    expect(res2.status()).toBe(200);
  });

  test("Impressum page flags incomplete placeholders visibly", async ({ page }) => {
    await page.goto("/impressum");
    const count = await page.getByText(/BITTE AUSFÜLLEN/).count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("Datenschutz page links back to Impressum for controller identity", async ({ page }) => {
    await page.goto("/datenschutz");
    await expect(page.locator('a[href="/impressum"]').first()).toBeVisible();
  });

  test("cookie banner shows on first visit and can be dismissed, stays dismissed", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000); // let the reduced-motion intro auto-dismiss
    const banner = page.getByRole("dialog", { name: "Cookies" });
    await expect(banner).toBeVisible();
    await banner.getByRole("button").click();
    await expect(banner).toBeHidden();

    await page.reload();
    await expect(page.getByRole("dialog", { name: "Cookies" })).toBeHidden();
  });

  test("toggling to English updates admin-portal-shared strings via translations (sanity: nav)", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000); // let the reduced-motion intro auto-dismiss
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    const toggle = page.locator("button", { hasText: /^(DE|EN)/ }).first();
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("menu page still renders after locale/admin i18n refactor", async ({ page }) => {
    const res = await page.goto("/menu");
    expect(res?.status()).toBe(200);
  });
});
