import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminSession } from "@/lib/adminAuth";
import { getDb } from "@/lib/firebaseAdmin";
import { imageUrlSchema } from "@/lib/validation";

const GalleryItemSchema = z.object({
  label: z.string().trim().min(1).max(60),
  imageUrl: imageUrlSchema,
  span: z.enum(["normal", "wide", "large"]).default("normal"),
  order: z.coerce.number().int().min(-10000).max(10000).default(0),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const snap = await getDb().collection("galleryImages").orderBy("order", "asc").get();
  const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const parsed = GalleryItemSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const docRef = await getDb().collection("galleryImages").add({
    ...parsed.data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ ok: true, id: docRef.id }, { status: 201 });
}
