import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminSession } from "@/lib/adminAuth";
import { getDb } from "@/lib/firebaseAdmin";
import { invalidateMenuCache } from "@/lib/menuServer";
import { getAllDefaultMenuItems, menuItemId } from "@/lib/defaultMenu";

/**
 * POST /api/admin/menu/seed
 * Deletes existing menuItems and writes the real Atlantic menu from defaultMenu.
 * Admin session required.
 */
export async function POST() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const db = getDb();
    const col = db.collection("menuItems");

    // Delete all existing menu documents
    const existing = await col.get();
    const batchSize = 400;
    let batch = db.batch();
    let ops = 0;

    for (const doc of existing.docs) {
      batch.delete(doc.ref);
      ops++;
      if (ops >= batchSize) {
        await batch.commit();
        batch = db.batch();
        ops = 0;
      }
    }
    if (ops > 0) await batch.commit();

    // Write new items
    const items = getAllDefaultMenuItems();
    batch = db.batch();
    ops = 0;
    const written: string[] = [];

    for (const item of items) {
      const id = menuItemId(item.category, item.name);
      batch.set(col.doc(id), {
        category: item.category,
        name: item.name,
        note: item.note,
        price: item.price,
        imageUrl: item.imageUrl,
        order: item.order,
        hidden: false,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: session.uid,
        seededFrom: "physical-menu-2026-09",
      });
      written.push(id);
      ops++;
      if (ops >= batchSize) {
        await batch.commit();
        batch = db.batch();
        ops = 0;
      }
    }
    if (ops > 0) await batch.commit();

    invalidateMenuCache();
    return NextResponse.json({
      ok: true,
      deleted: existing.size,
      written: written.length,
      ids: written,
    });
  } catch (error) {
    console.error("Menu seed failed:", error);
    const message = error instanceof Error ? error.message : "Seed failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}