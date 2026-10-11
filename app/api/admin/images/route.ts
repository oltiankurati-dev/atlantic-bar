import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminSession } from "@/lib/adminAuth";
import { getDb } from "@/lib/firebaseAdmin";
import { SITE_IMAGE_DEFAULTS } from "@/lib/siteContent";
import { imageUrlSchema, isOwnKey } from "@/lib/validation";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const snap = await getDb().collection("siteContent").get();
  const images: Record<string, string> = { ...SITE_IMAGE_DEFAULTS };

  for (const doc of snap.docs) {
    const data = doc.data();
    if (typeof data.imageUrl === "string" && data.imageUrl.trim() && isOwnKey(SITE_IMAGE_DEFAULTS, doc.id)) {
      images[doc.id] = data.imageUrl;
    }
  }
  return NextResponse.json({ images });
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const key = String(body?.key ?? "");
  const url = imageUrlSchema.safeParse(body?.imageUrl);

  if (!isOwnKey(SITE_IMAGE_DEFAULTS, key) || !url.success) {
    return NextResponse.json({ error: "Invalid image key or URL." }, { status: 400 });
  }
  const imageUrl = url.data;

  await getDb().collection("siteContent").doc(key).set(
    { imageUrl, updatedAt: FieldValue.serverTimestamp(), updatedBy: session.uid },
    { merge: true }
  );

  return NextResponse.json({ ok: true, key, imageUrl });
}
