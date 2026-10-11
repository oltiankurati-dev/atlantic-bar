import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { SITE_IMAGE_DEFAULTS } from "@/lib/siteContent";
import { isOwnKey } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
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

export async function PUT() {
  // Public reads are fine; writes are never accepted here.
  return NextResponse.json({ error: "Use the admin image endpoint." }, { status: 405 });
}
