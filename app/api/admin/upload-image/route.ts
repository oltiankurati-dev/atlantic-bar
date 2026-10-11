import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "uploads").replace(/[^a-z0-9_-]/gi, "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Please choose an image." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Use JPG, PNG, WEBP or AVIF." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be 8 MB or smaller." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { imageUrl } = await uploadImageToCloudinary(buffer, {
      folder: folder || "uploads",
      contentType: file.type,
    });

    return NextResponse.json({ ok: true, imageUrl });
  } catch (error) {
    console.error("Cloudinary image upload failed:", error);
    const message =
      error instanceof Error && error.message.includes("Missing Cloudinary")
        ? error.message
        : "Upload failed. Check Cloudinary configuration.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}