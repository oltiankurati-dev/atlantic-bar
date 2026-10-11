import { z } from "zod";
import type { MenuCategory } from "@/lib/defaultMenu";

/**
 * Admin-supplied image URLs are rendered by next/image across the public
 * site. Only absolute https URLs are accepted —
 * `javascript:`, `data:`, relative paths, and plain http are all rejected
 * (relative/garbage strings also make next/image throw at render time).
 */
export const imageUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Image URL must be an absolute https:// URL.");

/** `key in obj` also matches inherited keys like "constructor" — this doesn't. */
export function isOwnKey<T extends object>(obj: T, key: string): key is Extract<keyof T, string> {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/** Firestore doc ids taken from URL params: no slashes, no reserved __x__ ids. */
export function isSafeDocId(id: string): boolean {
  return /^[A-Za-z0-9_-]{1,128}$/.test(id) && !/^__.*__$/.test(id);
}

export const MENU_CATEGORIES = [
  "signature",
  "classics",
  "spirits",
  "wine",
  "champagne",
  "nonAlcoholic",
  "barSnacks",
] as const satisfies readonly MenuCategory[];

export const menuItemSchema = z.object({
  category: z.enum(MENU_CATEGORIES),
  name: z.string().trim().min(1).max(120),
  note: z.string().trim().min(1).max(500),
  price: z.string().trim().min(1).max(40),
  imageUrl: imageUrlSchema,
  order: z.coerce.number().int().min(-10000).max(10000).default(0),
});
