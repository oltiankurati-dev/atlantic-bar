import { test, expect } from "@playwright/test";

test.describe("Public pages render", () => {
  test("homepage loads with key sections, no console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(String(err)));

    const res = await page.goto("/");
    expect(res?.status()).toBe(200);

    await expect(page.locator("#reserve")).toBeVisible();
    await expect(page.locator('a[href="#reserve"]').first()).toBeVisible();

    const ignorable = /favicon|ERR_BLOCKED_BY_CLIENT|net::ERR_ABORTED/i;
    const real = consoleErrors.filter((e) => !ignorable.test(e));
    expect(real, `Console errors on homepage:\n${real.join("\n")}`).toEqual([]);
  });

  test("menu page loads", async ({ page }) => {
    const res = await page.goto("/menu");
    expect(res?.status()).toBe(200);
  });

  test("spielzeug (three.js) page loads without crashing", async ({ page }) => {
    const res = await page.goto("/spielzeug");
    expect(res?.status()).toBe(200);
  });

  test("BUG FIX REGRESSION: intro does not replay on a second visit within the same session", async ({ page }) => {
    await page.goto("/");
    // First visit: intro plays and must be skippable.
    const skipButton = page.locator("button", { hasText: /skip|überspringen/i });
    await skipButton.waitFor({ state: "visible", timeout: 5000 });
    await skipButton.click();
    await skipButton.waitFor({ state: "hidden", timeout: 3000 });
    await page.waitForTimeout(600);

    // Simulate the post-login redirect landing back on "/" a second time
    // in the same browser session (sessionStorage persists across this).
    await page.goto("/");
    // The intro must NOT re-mount: no WebGL canvas, no skip button, and the
    // reservation form must be immediately interactable.
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(skipButton).toHaveCount(0);
    // Reservation section content (sign-in prompt for an anonymous visitor)
    // must be immediately interactive, not blocked behind a replayed intro.
    await expect(page.locator("#reserve")).toBeVisible({ timeout: 3000 });
  });

  test("login page loads and shows sign-in form + both mode tabs (locale-agnostic)", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    // Two mode-toggle buttons (sign in / sign up) precede the form.
    await expect(page.locator("div.flex.gap-2.mb-8 button")).toHaveCount(2);
  });
});

test.describe("Admin route protection (unauthenticated)", () => {
  test("/admin/dashboard redirects to /login when signed out", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("nested admin pages also redirect", async ({ page }) => {
    for (const path of [
      "/admin/dashboard/menu",
      "/admin/dashboard/gallery",
      "/admin/dashboard/hours",
      "/admin/dashboard/images",
    ]) {
      await page.goto(path);
      await page.waitForURL(/\/login/);
      expect(page.url(), `${path} should redirect to /login`).toContain("/login");
    }
  });
});

test.describe("API authorization enforcement", () => {
  const protectedGet = [
    "/api/admin/reservations",
    "/api/admin/gallery",
    "/api/admin/hours",
    "/api/admin/images",
    "/api/admin/menu",
    "/api/my-reservations",
  ];

  for (const path of protectedGet) {
    test(`GET ${path} without auth -> 401`, async ({ request: req }) => {
      const res = await req.get(path);
      expect(res.status(), `${path} should require auth`).toBe(401);
    });
  }

  test("POST /api/reservation without token -> 401", async ({ request: req }) => {
    const res = await req.post("/api/reservation", {
      data: { name: "x", date: "2026-12-01", guests: 2 },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/reservation with garbage bearer token -> 401, not 500", async ({ request: req }) => {
    const res = await req.post("/api/reservation", {
      headers: { Authorization: "Bearer not-a-real-jwt.garbage.token" },
      data: { name: "x", date: "2026-12-01", guests: 2 },
    });
    expect(res.status()).toBe(401);
  });

  test("PATCH /api/admin/reservations/:id without auth -> 401 (no doc mutation)", async ({ request: req }) => {
    const res = await req.patch("/api/admin/reservations/does-not-exist", {
      data: { status: "confirmed" },
    });
    expect(res.status()).toBe(401);
  });

  test("DELETE /api/admin/reservations/:id without auth -> 401", async ({ request: req }) => {
    const res = await req.delete("/api/admin/reservations/does-not-exist");
    expect(res.status()).toBe(401);
  });

  test("path traversal / NoSQL-ish injection attempt in reservation id is rejected by auth gate first", async ({ request: req }) => {
    const payloads = ["../../etc/passwd", "%2e%2e%2f", "' OR '1'='1", "{$ne: null}"];
    for (const p of payloads) {
      const res = await req.delete(`/api/admin/reservations/${encodeURIComponent(p)}`);
      expect(res.status()).toBe(401);
    }
  });

  test("public GET endpoints work without auth and return expected shape", async ({ request: req }) => {
    const menu = await req.get("/api/menu");
    expect(menu.status()).toBe(200);
    const menuBody = await menu.json();
    expect(Array.isArray(menuBody.items)).toBe(true);

    const gallery = await req.get("/api/gallery");
    expect(gallery.status()).toBe(200);

    const hours = await req.get("/api/hours");
    expect(hours.status()).toBe(200);

    const siteContent = await req.get("/api/site-content");
    expect(siteContent.status()).toBe(200);
  });

  test("PUT /api/site-content is rejected (write-protected public route)", async ({ request: req }) => {
    const res = await req.put("/api/site-content", { data: { hero: "http://evil.example/x.png" } });
    expect(res.status()).toBe(405);
  });

  test("cross-origin writes to the API are rejected (CSRF defense)", async ({ request: req }) => {
    const res = await req.post("/api/auth/session", {
      headers: { Origin: "https://evil.example" },
      data: { idToken: "x" },
    });
    expect(res.status()).toBe(403);

    const del = await req.delete("/api/admin/reservations/abc", {
      headers: { Origin: "https://evil.example" },
    });
    expect(del.status()).toBe(403);
  });

  test("same-origin writes still reach the route handler", async ({ request: req, baseURL }) => {
    const res = await req.post("/api/auth/session", {
      headers: { Origin: new URL(baseURL!).origin },
      data: {},
    });
    expect(res.status()).toBe(400);
  });

  test("public site-content only exposes known image keys (no inherited props)", async ({ request: req }) => {
    const body = await (await req.get("/api/site-content")).json();
    expect(Object.keys(body.images)).not.toContain("constructor");
    expect(Object.keys(body.images)).toContain("hero");
  });

  test("/api/me without session -> user: null (no crash)", async ({ request: req }) => {
    const res = await req.get("/api/me");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.user).toBeNull();
  });
});

test.describe("Response header hardening", () => {
  test("security headers are present and correctly configured on every page", async ({ request: req }) => {
    const res = await req.get("/");
    const headers = res.headers();

    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["strict-transport-security"]).toContain("max-age=63072000");
    expect(headers["permissions-policy"]).toContain("camera=()");

    const csp = headers["content-security-policy"];
    expect(csp).toBeTruthy();
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
  });

  test("no CSP violations reported while loading the homepage", async ({ page }) => {
    const violations: string[] = [];
    page.on("console", (msg) => {
      if (msg.text().includes("Content Security Policy") || msg.text().includes("Refused to")) {
        violations.push(msg.text());
      }
    });
    // Not networkidle: the intro's animation loop and dev-server HMR socket
    // keep the network busy indefinitely, so it never quiesces.
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(3000);
    expect(violations, `CSP violations:\n${violations.join("\n")}`).toEqual([]);
  });

  test("session cookie is never set when not logging in", async ({ page }) => {
    await page.goto("/");
    const cookies = await page.context().cookies();
    const session = cookies.find((c) => c.name === "session");
    expect(session).toBeUndefined();
  });
});
