import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { getDb, getAdminAuth } from "@/lib/firebaseAdmin";
import { getMailer, getMailFrom, isMailerConfigured } from "@/lib/mailer";

// Basic in-memory rate limit (per server instance). Good enough to stop
// accidental double-submits and light abuse; not a substitute for a WAF.
// Keyed on both the (spoofable) client IP and the (unspoofable, cryptographically
// verified) account uid — the uid check can't be bypassed by forging
// X-Forwarded-For, which the IP-only check alone was vulnerable to.
const recentSubmissionsByIp = new Map<string, number>();
const recentSubmissionsByUid = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_BOOKING_AHEAD_DAYS = 365;

// Drop expired entries so the maps can't grow without bound on a
// long-lived server instance.
function pruneExpired(map: Map<string, number>) {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  for (const [key, time] of map) {
    if (time < cutoff) map.delete(key);
  }
}

// <input type="date"> always submits YYYY-MM-DD. Allow "yesterday" as slack
// for guests in a timezone behind the server's UTC clock.
function isBookableDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const day = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(day) || new Date(day).toISOString().slice(0, 10) !== value) return false;
  const todayUtc = Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);
  const dayMs = 24 * 60 * 60 * 1000;
  return day >= todayUtc - dayMs && day <= todayUtc + MAX_BOOKING_AHEAD_DAYS * dayMs;
}

const ReservationSchema = z.object({
  // No control characters — the name ends up in email subjects and bodies.
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100)
    .regex(/^[^\p{Cc}]+$/u, "Invalid name"),
  date: z.string().trim().refine(isBookableDate, "Please choose a date within the next year."),
  guests: z.coerce.number().int().min(1).max(50),
  // honeypot field — real users never fill this in
  company: z.string().max(0).optional().default(""),
  locale: z.enum(["de", "en"]).optional().default("de"),
});

const CUSTOMER_EMAIL_COPY = {
  de: {
    subject: "Ihre Reservierungsanfrage ist eingegangen",
    body: (name: string, date: string, guests: number) =>
      [
        `Guten Tag ${name},`,
        ``,
        `vielen Dank für Ihre Reservierungsanfrage im Atlantic Lounge Bar.`,
        ``,
        `Datum: ${date}`,
        `Personen: ${guests}`,
        ``,
        `Wir bestätigen Ihre Reservierung in Kürze persönlich.`,
        ``,
        `Wir freuen uns auf Ihren Besuch!`,
        `Ihr Atlantic Lounge Bar Team`,
      ].join("\n"),
  },
  en: {
    subject: "We've received your reservation request",
    body: (name: string, date: string, guests: number) =>
      [
        `Hello ${name},`,
        ``,
        `Thank you for your reservation request at Atlantic Lounge Bar.`,
        ``,
        `Date: ${date}`,
        `Guests: ${guests}`,
        ``,
        `We'll confirm your table personally shortly.`,
        ``,
        `We look forward to welcoming you!`,
        `The Atlantic Lounge Bar Team`,
      ].join("\n"),
  },
} as const;

export async function POST(req: NextRequest) {
  // Require a signed-in customer — every reservation must be tied to a
  // real account so the form can't be spammed anonymously.
  const authHeader = req.headers.get("authorization");
  const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(idToken, true);
  } catch {
    return NextResponse.json({ error: "Your sign-in has expired — please sign in again." }, { status: 401 });
  }

  // Google/Facebook accounts must have completed phone verification to book.
  const signInProvider = decoded.firebase?.sign_in_provider;
  const isOAuthAccount =
    signInProvider === "google.com" || signInProvider === "facebook.com";
  if (isOAuthAccount && !decoded.phone_number) {
    return NextResponse.json(
      { error: "Please verify your phone number before requesting a table." },
      { status: 403 }
    );
  }

  pruneExpired(recentSubmissionsByUid);
  pruneExpired(recentSubmissionsByIp);

  const lastSubmitByUid = recentSubmissionsByUid.get(decoded.uid);
  if (lastSubmitByUid && Date.now() - lastSubmitByUid < RATE_LIMIT_WINDOW_MS) {
    return NextResponse.json(
      { error: "Please wait a moment before submitting again." },
      { status: 429 }
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const lastSubmitByIp = recentSubmissionsByIp.get(ip);
  if (lastSubmitByIp && Date.now() - lastSubmitByIp < RATE_LIMIT_WINDOW_MS) {
    return NextResponse.json(
      { error: "Please wait a moment before submitting again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = ReservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }
  const { name, date, guests, locale } = parsed.data;

  try {
    const db = getDb();
    const docRef = await db.collection("reservations").add({
      name,
      date,
      guests,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      sourceIp: ip,
      userId: decoded.uid,
      userEmail: decoded.email ?? null,
    });

    // Email notifications — non-fatal if either fails; the reservation is
    // already saved in Firestore either way.
    const notifyEmail = process.env.RESERVATION_NOTIFY_EMAIL;
    const mailerReady = isMailerConfigured();

    if (mailerReady && notifyEmail) {
      try {
        await getMailer().sendMail({
          from: getMailFrom(),
          to: notifyEmail,
          subject: `New reservation request — ${name}`,
          text: [
            `New reservation request via the website:`,
            ``,
            `Name: ${name}`,
            `Date: ${date}`,
            `Guests: ${guests}`,
            `Reservation ID: ${docRef.id}`,
          ].join("\n"),
        });
      } catch (emailErr) {
        console.error("Reservation admin email failed to send:", emailErr);
      }
    }

    // Only email addresses the account has proven it owns — otherwise anyone
    // could sign up with a stranger's address and use this route to send
    // them mail from the bar's Gmail account.
    if (mailerReady && decoded.email && decoded.email_verified === true) {
      try {
        const copy = CUSTOMER_EMAIL_COPY[locale];
        await getMailer().sendMail({
          from: getMailFrom(),
          to: decoded.email,
          subject: copy.subject,
          text: copy.body(name, date, guests),
        });
      } catch (emailErr) {
        console.error("Reservation customer email failed to send:", emailErr);
      }
    }

    recentSubmissionsByIp.set(ip, Date.now());
    recentSubmissionsByUid.set(decoded.uid, Date.now());
    return NextResponse.json({ ok: true, id: docRef.id }, { status: 201 });
  } catch (err) {
    console.error("Reservation submission failed:", err);
    return NextResponse.json(
      { error: "Something went wrong saving your reservation. Please try again." },
      { status: 500 }
    );
  }
}
