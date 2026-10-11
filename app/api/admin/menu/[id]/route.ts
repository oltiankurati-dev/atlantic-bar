import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminSession } from "@/lib/adminAuth";
import { getDb } from "@/lib/firebaseAdmin";
import { DEFAULT_ITEMS, type MenuCategory } from "@/lib/defaultMenu";
import { isSafeDocId, menuItemSchema } from "@/lib/validation";

const CATEGORIES: MenuCategory[] = [
  "signature",
  "classics",
  "spirits",
  "wine",
  "champagne",
  "nonAlcoholic",
  "barSnacks",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  if (!isSafeDocId(id)) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const parsed = menuItemSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please complete all menu fields." },
      { status: 400 }
    );
  }
  const { category, name, note, price, imageUrl, order } = parsed.data;

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
  const isDefault = CATEGORIES.some((category) =>
    DEFAULT_ITEMS[category].some((item) => {
      const slug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return `${slug(category)}-${slug(item.name)}` === id;
    })
  );

  if (isDefault) {
    await getDb().collection("menuItems").doc(id).set(
      { hidden: true, updatedAt: FieldValue.serverTimestamp(), updatedBy: session.uid },
      { merge: true }
    );
  } else {
    await getDb().collection("menuItems").doc(id).delete();
  }

  return NextResponse.json({ ok: true });
}
