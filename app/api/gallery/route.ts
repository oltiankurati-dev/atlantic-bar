import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";

// Public — gallery photos shown on the site, not sensitive data.
export async function GET() {
  const snap = await getDb().collection("galleryImages").orderBy("order", "asc").get();
  // Explicit field list — never echo whole documents to the public.
  const items = snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      label: data.label ?? "",
      imageUrl: data.imageUrl ?? "",
      span: data.span ?? "normal",
      order: data.order ?? 0,
    };
  });
  return NextResponse.json({ items });
}
