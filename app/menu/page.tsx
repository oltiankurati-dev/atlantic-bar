import type { Metadata } from "next";
import MenuView from "@/components/menu/MenuView";
import { getAllDefaultMenuItems, menuItemId } from "@/lib/defaultMenu";
import { getCachedMenuItems, type MenuItem } from "@/lib/menuServer";

// Rebuilt at most every 5 minutes; admin edits clear the menu cache sooner.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Getränkekarte — Atlantic Lounge Bar",
  description:
    "Cocktails, Bier, Wein, Spirituosen und Kaffee in der Atlantic Lounge Bar — die aktuelle Getränkekarte mit Preisen.",
  alternates: { canonical: "/menu" },
};

async function loadItems(): Promise<MenuItem[]> {
  try {
    const items = await getCachedMenuItems();
    if (items.length > 0) return items;
  } catch (err) {
    console.error("Menu load failed, showing the built-in menu:", err);
  }
  return getAllDefaultMenuItems().map((item) => ({
    ...item,
    id: menuItemId(item.category, item.name),
  }));
}

export default async function MenuPage() {
  return <MenuView items={await loadItems()} />;
}
