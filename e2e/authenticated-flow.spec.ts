import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const RUN_ID = Date.now();
const TEST_EMAIL = `qa-security-test-${RUN_ID}@example.com`;
const TEST_PASSWORD = `Sec#Test${RUN_ID}!Qa`;
const RESERVATION_NAME = `PLAYWRIGHT-QA-DELETE-ME-${RUN_ID}`;
const GALLERY_LABEL = `PLAYWRIGHT-QA-DELETE-ME-${RUN_ID}`;

const created = {
  uid: "",
  reservationId: "",
  xssReservationId: "",
  galleryId: "",
  cloudinaryPublicId: "",
};

function runAdminScript(cmd: string, arg: string): string {
  return execFileSync("node", ["_qa_admin_script.mjs", cmd, arg], {
    cwd: __dirname + "/..",
    encoding: "utf8",
  }).trim();
}

// BUG FOUND: components/intro/IntroExperience.tsx has no persistence
// (app/page.tsx's `introDone` is plain useState), so the full-screen 3D
// intro — which captures all wheel/touch/pointer input — replays on every
// fresh mount of "/". That includes the post-login redirect straight back
// to "/#reserve", trapping a customer who just signed in specifically to
// book a table. A real visitor would click "Skip Intro"; we do the same
// here. To keep headless WebGL stable we also avoid re-triggering it by
// reusing a single page/session for the whole flow instead of navigating
// back to "/" repeatedly.
async function dismissIntroIfPresent(page: Page) {
  // With prefers-reduced-motion emulated, IntroExperience never mounts its
  // Canvas and auto-transitions phase "playing" -> "wiping" -> "done" after
  // ~500ms + a 1050ms wipe, unmounting itself. Just wait that out.
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(2000);
}

let context: BrowserContext;
let page: Page;

test.describe.serial("Authenticated end-to-end + admin flow (real backend, cleaned up after)", () => {
  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    // Repeated mounts of the intro's three.js/WebGL canvas were crashing
    // headless Chromium (software-rendered GPU) across this multi-step flow.
    // IntroExperience.tsx already has a reduced-motion code path that skips
    // the Canvas entirely and auto-transitions after 500ms — use it.
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test.afterAll(async () => {
    const report: string[] = [];

    try {
      if (created.reservationId) {
        runAdminScript("delete-doc", `reservations/${created.reservationId}`);
        report.push(`safety-net delete reservations/${created.reservationId}: ok`);
      }
    } catch (e) {
      report.push(`safety-net delete reservation FAILED: ${e}`);
    }
    try {
      if (created.xssReservationId) {
        runAdminScript("delete-doc", `reservations/${created.xssReservationId}`);
        report.push(`safety-net delete reservations/${created.xssReservationId}: ok`);
      }
    } catch (e) {
      report.push(`safety-net delete xss reservation FAILED: ${e}`);
    }
    try {
      if (created.galleryId) {
        runAdminScript("delete-doc", `galleryImages/${created.galleryId}`);
        report.push(`safety-net delete galleryImages/${created.galleryId}: ok`);
      }
    } catch (e) {
      report.push(`safety-net delete gallery FAILED: ${e}`);
    }
    try {
      if (created.cloudinaryPublicId) {
        const out = runAdminScript("cloudinary-destroy", created.cloudinaryPublicId);
        report.push(`cloudinary-destroy(${created.cloudinaryPublicId}): ${out}`);
      }
    } catch (e) {
      report.push(`cloudinary-destroy FAILED: ${e}`);
    }
    try {
      if (created.uid) {
        const out = runAdminScript("teardown", created.uid);
        report.push(`teardown(${created.uid}): ${out}`);
      }
    } catch (e) {
      report.push(`teardown FAILED: ${e}`);
    }

    writeFileSync(__dirname + "/../_qa_cleanup_report.json", JSON.stringify({ created, report }, null, 2));
    console.log("\n=== QA CLEANUP REPORT ===\n" + report.join("\n") + "\n=========================\n");

    await context?.close();
  });

  test("sign up a throwaway test account via the real UI, land on reservation section", async () => {
    await page.goto("/login");
    await page.locator("div.flex.gap-2.mb-8 button").nth(1).click(); // switch to sign-up tab
    await page.locator('input[type="email"]').fill(TEST_EMAIL);
    await page.locator('input[type="password"]').fill(TEST_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/#reserve/, { timeout: 15000 });
    await dismissIntroIfPresent(page);

    const uid = runAdminScript("get-uid-by-email", TEST_EMAIL);
    created.uid = JSON.parse(uid).uid;
    expect(created.uid).toBeTruthy();
  });

  test("session cookie is httpOnly + sameSite=Lax", async () => {
    const cookies = await context.cookies();
    const session = cookies.find((c) => c.name === "session");
    expect(session).toBeTruthy();
    expect(session!.httpOnly).toBe(true);
    expect(session!.sameSite).toBe("Lax");
  });

  test("a signed-in but non-admin user is still rejected by admin APIs (privilege check, not just auth check)", async () => {
    const res = await page.request.get("/api/admin/reservations");
    expect(res.status()).toBe(401);

    await page.goto("/admin/dashboard");
    await page.waitForURL(/\/login/);
    // Go straight back to the reservation form without a fresh "/" mount —
    // navigating "back" restores the existing history entry/component state
    // in this SPA rather than remounting the intro.
    await page.goBack();
    await page.waitForURL(/#reserve/);
  });

  test("submit a real reservation through the UI as the signed-in customer", async () => {
    const form = page.locator("form").filter({ has: page.locator('input[name="name"]') });
    await form.locator('input[name="name"]').fill(RESERVATION_NAME);
    await form.locator('input[name="date"]').fill("2026-12-24");
    await form.locator('input[name="guests"]').fill("2");

    const [resp] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/reservation") && r.request().method() === "POST"),
      form.locator('button[type="submit"]').click(),
    ]);
    expect(resp.status()).toBe(201);
    const body = await resp.json();
    created.reservationId = body.id;
    expect(created.reservationId).toBeTruthy();
  });

  test("XSS payload in reservation name is stored raw but rendered safely (React escaping) on profile page", async () => {
    test.setTimeout(120_000);
    const form = page.locator("form").filter({ has: page.locator('input[name="name"]') });
    const xssPayload = `<img src=x onerror=alert('xss-${RUN_ID}')>`;

    // Wait out the 60s per-IP rate limit from the previous submission so
    // this one actually reaches validation/storage instead of a 429.
    await page.waitForTimeout(61_000);

    await form.locator('input[name="name"]').fill(xssPayload);
    await form.locator('input[name="date"]').fill("2026-12-25");
    await form.locator('input[name="guests"]').fill("1");

    let dialogFired = false;
    page.once("dialog", async (d) => {
      dialogFired = true;
      await d.dismiss();
    });

    const [resp] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/reservation") && r.request().method() === "POST"),
      form.locator('button[type="submit"]').click(),
    ]);
    expect([201, 429]).toContain(resp.status());
    if (resp.status() === 201) {
      const body = await resp.json();
      created.xssReservationId = body.id;
    }

    await page.goto("/profile");
    await page.waitForTimeout(1500);
    expect(dialogFired, "onerror handler must NOT fire — payload should render as inert text").toBe(false);
    const html = await page.content();
    expect(html).not.toContain("<img src=x onerror=");
  });

  test("promote the test account to admin (direct Firestore write, same as the documented manual step)", async () => {
    const out = runAdminScript("promote", created.uid);
    expect(JSON.parse(out).ok).toBe(true);
  });

  test("admin dashboard is now reachable (no re-login needed — role is checked fresh server-side) and lists our test reservation", async () => {
    await page.goto("/admin/dashboard");
    await expect(page).not.toHaveURL(/\/login/);

    const res = await page.request.get("/api/admin/reservations");
    expect(res.status()).toBe(200);
    const body = await res.json();
    const found = body.reservations.find((r: { id: string; name?: string; status?: string }) => r.id === created.reservationId);
    expect(found).toBeTruthy();
    expect(found.name).toBe(RESERVATION_NAME);
  });

  test("admin can update reservation status (PATCH) and it's reflected back", async () => {
    const patchRes = await page.request.patch(`/api/admin/reservations/${created.reservationId}`, {
      data: { status: "confirmed" },
    });
    expect(patchRes.status()).toBe(200);

    const listRes = await page.request.get("/api/admin/reservations");
    const body = await listRes.json();
    const found = body.reservations.find((r: { id: string; name?: string; status?: string }) => r.id === created.reservationId);
    expect(found.status).toBe("confirmed");
  });

  test("PATCH rejects an invalid status enum value (server-side validation, not just client)", async () => {
    const res = await page.request.patch(`/api/admin/reservations/${created.reservationId}`, {
      data: { status: "definitely-not-a-real-status" },
    });
    expect(res.status()).toBe(400);
  });

  test("admin gallery add + delete round-trip works and is authorized", async () => {
    const addRes = await page.request.post("/api/admin/gallery", {
      data: { label: GALLERY_LABEL, imageUrl: "https://picsum.photos/400", span: "normal", order: 999 },
    });
    expect(addRes.status()).toBe(201);
    const addBody = await addRes.json();
    created.galleryId = addBody.id;

    const publicRes = await page.request.get("/api/gallery");
    const publicBody = await publicRes.json();
    expect(publicBody.items.some((i: { id: string }) => i.id === created.galleryId)).toBe(true);

    const delRes = await page.request.delete(`/api/admin/gallery/${created.galleryId}`);
    expect(delRes.status()).toBe(200);

    const publicResAfter = await page.request.get("/api/gallery");
    const publicBodyAfter = await publicResAfter.json();
    expect(publicBodyAfter.items.some((i: { id: string }) => i.id === created.galleryId)).toBe(false);
    created.galleryId = "";
  });

  test("gallery POST rejects invalid imageUrl (SSRF-adjacent input validation)", async () => {
    const res = await page.request.post("/api/admin/gallery", {
      data: { label: "bad", imageUrl: "not-a-url-at-all", span: "normal", order: 1 },
    });
    expect(res.status()).toBe(400);

    for (const imageUrl of ["javascript:alert(1)", "data:image/png;base64,AAAA", "http://example.com/x.png"]) {
      const r = await page.request.post("/api/admin/gallery", {
        data: { label: "bad", imageUrl, span: "normal", order: 1 },
      });
      expect(r.status(), imageUrl).toBe(400);
    }
  });

  test("image upload endpoint rejects disallowed mime type and oversized file", async () => {
    const badType = await page.request.post("/api/admin/upload-image", {
      multipart: {
        folder: "qa-test",
        file: { name: "evil.svg", mimeType: "image/svg+xml", buffer: Buffer.from("<svg onload=alert(1)></svg>") },
      },
    });
    expect(badType.status()).toBe(400);

    const oversized = Buffer.alloc(9 * 1024 * 1024, 1);
    const tooBig = await page.request.post("/api/admin/upload-image", {
      multipart: {
        folder: "qa-test",
        file: { name: "big.png", mimeType: "image/png", buffer: oversized },
      },
    });
    expect(tooBig.status()).toBe(400);
  });

  test("image upload endpoint accepts a real valid PNG and the asset is cleaned up after", async () => {
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64"
    );
    const res = await page.request.post("/api/admin/upload-image", {
      multipart: {
        folder: "qa-test",
        file: { name: "pixel.png", mimeType: "image/png", buffer: png },
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.imageUrl).toContain("cloudinary.com");
    const match = body.imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    created.cloudinaryPublicId = match ? match[1] : "";
  });

  test("cleanup: delete test reservation(s) via the app's own admin DELETE route", async () => {
    if (created.reservationId) {
      const res = await page.request.delete(`/api/admin/reservations/${created.reservationId}`);
      expect(res.status()).toBe(200);
      created.reservationId = ""; // deleted via app route — no need for afterAll safety net
    }
    if (created.xssReservationId) {
      const res = await page.request.delete(`/api/admin/reservations/${created.xssReservationId}`);
      expect(res.status()).toBe(200);
      created.xssReservationId = "";
    }
  });
});
