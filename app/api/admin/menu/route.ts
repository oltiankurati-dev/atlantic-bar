import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminSession } from "@/lib/adminAuth";
import { getDb } from "@/lib/firebaseAdmin";
import { menuItemId } from "@/lib/defaultMenu";
import { getMergedMenuItems, invalidateMenuCache } from "@/lib/menuServer";
import { menuItemSchema } from "@/lib/validation";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ items: await getMergedMenuItems() });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const parsed = menuItemSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please complete all menu fields." },
      { status: 400 }
    );
  }
  const { category, name, note, price, imageUrl, order } = parsed.data;

  const id = menuItemId(category, name);
  await getDb().collection("menuItems").doc(id).set(
    {
      category,
      name,
      note,
      price,
      imageUrl,
      order,
      hidden: false,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: session.uid,
    },
    { merge: true }
  );

  invalidateMenuCache();
  return NextResponse.json({ ok: true, id }, { status: 201 });
}
