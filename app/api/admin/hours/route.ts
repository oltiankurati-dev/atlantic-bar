import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminSession } from "@/lib/adminAuth";
import { getDb } from "@/lib/firebaseAdmin";
import { DAY_ORDER, isValidDayHours } from "@/lib/businessHours";
import { getBusinessHours } from "@/lib/businessHoursServer";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  return NextResponse.json({ hours: await getBusinessHours() });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const days = body?.days;
  if (!days || typeof days !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  for (const day of DAY_ORDER) {
    if (!isValidDayHours(days[day])) {
      return NextResponse.json({ error: `Missing or invalid hours for ${day}.` }, { status: 400 });
    }
  }

  await getDb().collection("siteContent").doc("businessHours").set(
    {
      days,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: session.uid,
    },
    { merge: true }
  );

  return NextResponse.json({ ok: true });
}
