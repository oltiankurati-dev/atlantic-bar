import { PHOTOS } from "@/lib/images";

export type MenuCategory =
  | "signature"
  | "classics"
  | "spirits"
  | "wine"
  | "champagne"
  | "nonAlcoholic"
  | "barSnacks";

export const MENU_CATEGORIES = [
  "signature",
  "classics",
  "spirits",
  "wine",
  "champagne",
  "nonAlcoholic",
  "barSnacks",
] as const satisfies readonly MenuCategory[];

function slug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Firestore doc id for a menu item, e.g. "wine-rose" for Rosé. */
export function menuItemId(category: string, name: string) {
  return `${slug(category)}-${slug(name)}`;
}

/**
 * The id older code produced, which dropped accented letters entirely
 * ("Rosé" -> "ros"). Docs saved under it are still matched so admin edits
 * made before the fix keep working.
 */
export function legacyMenuItemId(category: string, name: string) {
  const old = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${old(category)}-${old(name)}`;
}

/** True when the id belongs to one of the built-in menu items. */
export function isDefaultMenuItemId(id: string) {
  return MENU_CATEGORIES.some((category) =>
    DEFAULT_ITEMS[category].some(
      (item) => menuItemId(category, item.name) === id || legacyMenuItemId(category, item.name) === id
    )
  );
}

export interface DefaultMenuItem {
  name: string;
  note: string;
  price: string;
  imageUrl: string;
}

/**
 * Real Kaffee Bar Atlantic menu (from physical menu cards).
 * Used as the built-in fallback and as the source for DB seed.
 */
export const DEFAULT_ITEMS: Record<MenuCategory, DefaultMenuItem[]> = {
  wine: [
    {
      name: "Retsina Malamatina",
      note: "0,5 l",
      price: "8,00",
      imageUrl: PHOTOS.whiskeyWhiteTable,
    },
    {
      name: "Rosé",
      note: "0,25 l",
      price: "4,00",
      imageUrl: PHOTOS.whiskeyOrange,
    },
  ],

  spirits: [
    { name: "Asbach", note: "Spirituose", price: "3,00", imageUrl: PHOTOS.whiskeyWoodTable },
    { name: "Jack Daniel's", note: "Spirituose", price: "3,00", imageUrl: PHOTOS.whiskeyBrown },
    { name: "Johnnie Walker", note: "Spirituose", price: "3,00", imageUrl: PHOTOS.whiskeyWood2 },
    { name: "Wodka", note: "Spirituose", price: "3,00", imageUrl: PHOTOS.whiskeyWhiteTable },
    { name: "Drambuie", note: "Spirituose", price: "3,00", imageUrl: PHOTOS.whiskeyOrange },
    { name: "Havana", note: "Rum", price: "3,00", imageUrl: PHOTOS.heroPour },
    { name: "Bacardi", note: "Rum", price: "3,00", imageUrl: PHOTOS.cocktailOlives },
    { name: "Jägermeister", note: "Spirituose", price: "3,00", imageUrl: PHOTOS.whiskeyIce },
    { name: "Ouzo", note: "Spirituose", price: "3,00", imageUrl: PHOTOS.whiskeyWoodTable },
    { name: "Alle Kurzen", note: "0,2 l", price: "2,00", imageUrl: PHOTOS.whiskeyBrown },
    { name: "Alle Longdrinks", note: "Longdrink", price: "6,00", imageUrl: PHOTOS.whiskeyOrange },
  ],

  signature: [
    {
      name: "Alle Cocktails",
      note: "Hauscocktails",
      price: "7,00",
      imageUrl: PHOTOS.heroPour,
    },
    {
      name: "Aperol Spritz + Prosecco",
      note: "Aperol, Prosecco",
      price: "6,50",
      imageUrl: PHOTOS.cocktailOlives,
    },
  ],

  classics: [
    { name: "Beck's Pils", note: "0,5 l", price: "3,50", imageUrl: PHOTOS.whiskeyIce },
    { name: "Rothbier Hefe", note: "0,5 l", price: "3,50", imageUrl: PHOTOS.whiskeyOrange },
    { name: "Rothbier Bleifrei", note: "0,5 l · alkoholfrei", price: "3,50", imageUrl: PHOTOS.whiskeyWhiteTable },
    { name: "Radler", note: "0,5 l", price: "3,50", imageUrl: PHOTOS.cocktailOlives },
    { name: "Corona", note: "0,35 l", price: "4,00", imageUrl: PHOTOS.whiskeyBrown },
    { name: "Salitos", note: "0,33 l", price: "4,00", imageUrl: PHOTOS.whiskeyWood2 },
  ],

  champagne: [],

  nonAlcoholic: [
    { name: "Wasser still", note: "0,5 l", price: "1,50", imageUrl: PHOTOS.whiskeyWhiteTable },
    { name: "Wasser spritzig", note: "0,4 l", price: "2,50", imageUrl: PHOTOS.whiskeyWhiteTable },
    { name: "Coca Cola", note: "0,4 l", price: "2,50", imageUrl: PHOTOS.whiskeyBrown },
    { name: "Orangenlimo", note: "0,5 l", price: "3,00", imageUrl: PHOTOS.whiskeyOrange },
    { name: "Spezi", note: "0,5 l", price: "3,00", imageUrl: PHOTOS.cocktailOlives },
    { name: "Orangensaft", note: "0,4 l", price: "2,50", imageUrl: PHOTOS.heroPour },
    { name: "Red Bull", note: "Dose", price: "3,50", imageUrl: PHOTOS.whiskeyIce },
    { name: "Frappé", note: "Café", price: "4,00", imageUrl: PHOTOS.woodenTable },
    { name: "Freddo Espresso", note: "Café", price: "4,00", imageUrl: PHOTOS.woodenTable },
    { name: "Freddo Cappuccino", note: "Café", price: "4,50", imageUrl: PHOTOS.woodenTable },
    { name: "Cappuccino", note: "Café", price: "3,50", imageUrl: PHOTOS.woodenTable },
    { name: "Espresso", note: "Café", price: "3,00", imageUrl: PHOTOS.woodenTable },
    { name: "Café", note: "Café", price: "2,50", imageUrl: PHOTOS.woodenTable },
    { name: "Latte Macchiato", note: "Café", price: "4,00", imageUrl: PHOTOS.woodenTable },
    { name: "Milch Café", note: "Café", price: "3,50", imageUrl: PHOTOS.woodenTable },
    { name: "Greek Moka klein", note: "Café", price: "2,50", imageUrl: PHOTOS.woodenTable },
    { name: "Greek Moka groß", note: "Café", price: "3,50", imageUrl: PHOTOS.woodenTable },
  ],

  barSnacks: [],
};

/** Flat list for seeding Firestore */
export function getAllDefaultMenuItems() {
  return MENU_CATEGORIES.flatMap((category) =>
    DEFAULT_ITEMS[category].map((item, order) => ({ category, ...item, order }))
  );
}
