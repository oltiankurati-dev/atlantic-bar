import { NextResponse, type NextRequest } from "next/server";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF defense-in-depth for the API. The session cookie is SameSite=Lax,
 * which already blocks most cross-site writes; this additionally rejects any
 * state-changing request whose Origin header doesn't match the host — the
 * same check Next.js applies to Server Actions. Requests with no Origin at
 * all (curl, server-to-server) are let through: browsers always send Origin
 * on cross-origin POST/PATCH/PUT/DELETE, so they can't be used for CSRF.
 */
export function proxy(req: NextRequest) {
  if (SAFE_METHODS.has(req.method)) return NextResponse.next();

  const origin = req.headers.get("origin");
  if (!origin) return NextResponse.next();

  const host = (req.headers.get("x-forwarded-host") ?? req.headers.get("host"))
    ?.split(",")[0]
    ?.trim();
  let originHost: string | null = null;
  try {
    originHost = new URL(origin).host;
  } catch {
    // "null" origin (sandboxed iframes, file://) or garbage — treat as foreign.
  }

  if (!host || originHost !== host) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
