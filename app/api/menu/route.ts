import { NextResponse } from "next/server";
import { getCachedMenuItems } from "@/lib/menuServer";

export async function GET() {
  return NextResponse.json({ items: await getCachedMenuItems() });
}
