import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { readJson, requireAdmin } from "@/lib/admin-api";

// POST /api/admin/cloudinary-sign — signs upload-widget params so only admins can upload
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const body = await readJson(req);
  const paramsToSign = body?.paramsToSign;
  if (!paramsToSign || typeof paramsToSign !== "object")
    return NextResponse.json({ error: "paramsToSign required" }, { status: 400 });

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign as Record<string, string>,
    process.env.CLOUDINARY_API_SECRET!
  );
  return NextResponse.json({ signature });
}
