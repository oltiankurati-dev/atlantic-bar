import "server-only";
import { revalidateTag, unstable_cache } from "next/cache";
import { getDb } from "@/lib/firebaseAdmin";
import {
  DEFAULT_ITEMS,
  MENU_CATEGORIES,
  legacyMenuItemId,
  menuItemId,
  type MenuCategory,
} from "@/lib/defaultMenu";

export interface MenuItem {
  id: string;
  category: MenuCategory;
  name: string;
  note: string;
  price: string;
  imageUrl: string;
  order: number;
}

type MenuOverride = Record<string, unknown> & { id: string };

const isCategory = (value: unknown): value is MenuCategory =>
  (MENU_CATEGORIES as readonly unknown[]).includes(value);

/**
 * The built-in menu merged with what admins saved in Firestore: saved docs
 * override built-in items with the same id, hidden ones are dropped, and
 * admin-created items are appended. Sorted by category, then order.
 */
export async function getMergedMenuItems(): Promise<MenuItem[]> {
  const snap = await getDb().collection("menuItems").get();
  const overrides = new Map<string, MenuOverride>(
    snap.docs.map((doc): [string, MenuOverride] => [doc.id, { ...doc.data(), id: doc.id }])
  );
  const items: MenuItem[] = [];

  for (const category of MENU_CATEGORIES) {
    for (const [index, base] of DEFAULT_ITEMS[category].entries()) {
      const id = menuItemId(category, base.name);
      const legacyId = legacyMenuItemId(category, base.name);
      const override = overrides.get(id) ?? overrides.get(legacyId);
      overrides.delete(id);
      overrides.delete(legacyId);
      if (override?.hidden === true) continue;

      items.push({
        id: override?.id ?? id,
        category,
        name: String(override?.name ?? base.name),
        note: String(override?.note ?? base.note),
        price: String(override?.price ?? base.price),
        imageUrl: String(override?.imageUrl ?? base.imageUrl),
        order: Number(override?.order ?? index),
      });
    }
  }

  // Items created by the admin that aren't part of the built-in menu.
  for (const [id, item] of overrides) {
    if (item.hidden === true) continue;
    items.push({
      id,
      category: isCategory(item.category) ? item.category : "signature",
      name: String(item.name ?? ""),
      note: String(item.note ?? ""),
      price: String(item.price ?? ""),
      imageUrl: String(item.imageUrl ?? ""),
      order: Number(item.order ?? 999),
    });
  }

  items.sort(
    (a, b) =>
      MENU_CATEGORIES.indexOf(a.category) - MENU_CATEGORIES.indexOf(b.category) ||
      a.order - b.order
  );
  return items;
}

export const MENU_CACHE_TAG = "menu";

/**
 * Public menu, cached for 5 minutes so each visit isn't several Firestore
 * reads. Admin edits call invalidateMenuCache() so changes show at once.
 */
export const getCachedMenuItems = unstable_cache(getMergedMenuItems, ["menu-items"], {
  tags: [MENU_CACHE_TAG],
  revalidate: 300,
});

export function invalidateMenuCache() {
  // expire: 0 — the next visitor gets fresh data, not the stale copy.
  revalidateTag(MENU_CACHE_TAG, { expire: 0 });
}
