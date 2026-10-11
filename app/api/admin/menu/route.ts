import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminSession } from "@/lib/adminAuth";
import { getDb } from "@/lib/firebaseAdmin";
import { DEFAULT_ITEMS, type MenuCategory } from "@/lib/defaultMenu";
import { menuItemSchema } from "@/lib/validation";

type MenuOverride = Record<string, unknown> & { id: string };

const CATEGORIES: MenuCategory[] = [
  "signature",
  "classics",
  "spirits",
  "wine",
  "champagne",
  "nonAlcoholic",
  "barSnacks",
];

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function makeId(category: string, name: string) {
  return `${slug(category)}-${slug(name)}`;
}

async function getMergedItems() {
  const snap = await getDb().collection("menuItems").get();
  const overrides = new Map<string, MenuOverride>(
    snap.docs.map((doc): [string, MenuOverride] => [doc.id, { ...doc.data(), id: doc.id }])
  );
  const items: Record<string, unknown>[] = [];

  for (const category of CATEGORIES) {
    for (const [index, base] of DEFAULT_ITEMS[category].entries()) {
      const id = makeId(category, base.name);
      const override = overrides.get(id);
      if (override?.hidden === true) continue;
      items.push({
        id,
        category,
        name: override?.name ?? base.name,
        note: override?.note ?? base.note,
        price: override?.price ?? base.price,
        imageUrl: override?.imageUrl ?? base.imageUrl,
        order: Number(override?.order ?? index),
      });
      overrides.delete(id);
    }
  }

  for (const [id, item] of overrides) {
    if (item.hidden === true) continue;
    items.push({
      id,
      category: CATEGORIES.includes(item.category as MenuCategory) ? item.category : "signature",
      name: item.name ?? "",
      note: item.note ?? "",
      price: item.price ?? "",
      imageUrl: item.imageUrl ?? "",
      order: Number(item.order ?? 999),
    });
  }

  return items;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ items: await getMergedItems() });
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

  const id = makeId(category, name);
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

  return NextResponse.json({ ok: true, id }, { status: 201 });
}
