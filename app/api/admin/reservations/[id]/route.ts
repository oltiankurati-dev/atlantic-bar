import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/adminAuth";
import { getDb } from "@/lib/firebaseAdmin";
import { getMailer, getMailFrom, isMailerConfigured } from "@/lib/mailer";
import { isSafeDocId } from "@/lib/validation";

const StatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "waitlist"]),
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  waitlist: "Waitlist",
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  if (!isSafeDocId(id)) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const body = await req.json().catch(() => null);
  const parsed = StatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const status = parsed.data.status;
  const docRef = getDb().collection("reservations").doc(id);
  const snapshot = await docRef.get();
  if (!snapshot.exists) {
    return NextResponse.json({ error: "Reservation not found." }, { status: 404 });
  }
  await docRef.update({ status });

  // Notify the admin inbox of every status change — non-fatal if it fails,
  // the status update itself already succeeded.
  const notifyEmail = process.env.RESERVATION_NOTIFY_EMAIL;
  if (isMailerConfigured() && notifyEmail) {
    const data = snapshot.data() ?? {};
    try {
      await getMailer().sendMail({
        from: getMailFrom(),
        to: notifyEmail,
        subject: `Reservation ${STATUS_LABEL[status] ?? status} — ${data.name ?? "Unknown"}`,
        text: [
          `A reservation status was changed to "${STATUS_LABEL[status] ?? status}":`,
          ``,
          `Name: ${data.name ?? "Unknown"}`,
          `Date: ${data.date ?? "Unknown"}`,
          `Guests: ${data.guests ?? "Unknown"}`,
          `Reservation ID: ${id}`,
        ].join("\n"),
      });
    } catch (emailErr) {
      console.error("Reservation status-change admin email failed to send:", emailErr);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  if (!isSafeDocId(id)) return NextResponse.json({ error: "Not found." }, { status: 404 });
  await getDb().collection("reservations").doc(id).delete();
  return NextResponse.json({ ok: true });
}
