import { NextResponse } from "next/server";
import { getBusinessHours } from "@/lib/businessHoursServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const hours = await getBusinessHours();
  return NextResponse.json({ hours });
}
