import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { DEFAULT_ITEMS, type MenuCategory } from "@/lib/defaultMenu";

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

function key(category: MenuCategory, name: string) {
  return `${slug(category)}-${slug(name)}`;
}

export async function GET() {
  const snap = await getDb().collection("menuItems").get();
  const overrides = new Map<string, MenuOverride>(
    snap.docs.map((doc): [string, MenuOverride] => [doc.id, { ...doc.data(), id: doc.id }])
  );

  const items: Array<Record<string, unknown>> = [];

  for (const category of CATEGORIES) {
    for (const [index, base] of DEFAULT_ITEMS[category].entries()) {
      const id = key(category, base.name);
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

  // Items created by the admin that were not part of the original hard-coded menu.
  for (const [id, item] of overrides) {
    if (item.hidden === true) continue;
    items.push({
      id,
      category: CATEGORIES.includes(item.category as MenuCategory)
        ? item.category
        : "signature",
      name: item.name ?? "",
      note: item.note ?? "",
      price: item.price ?? "",
      imageUrl: item.imageUrl ?? "",
      order: Number(item.order ?? 999),
    });
  }

  items.sort((a, b) => {
    const ca = CATEGORIES.indexOf(a.category as MenuCategory);
    const cb = CATEGORIES.indexOf(b.category as MenuCategory);
    return ca - cb || Number(a.order) - Number(b.order);
  });

  return NextResponse.json({ items });
}
