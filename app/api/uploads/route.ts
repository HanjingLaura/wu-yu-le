import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { persistUploadedImage } from "@/lib/upload-image";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const body = (await request.json()) as { dataUrl?: string };
  const dataUrl = typeof body.dataUrl === "string" ? body.dataUrl : "";
  if (!dataUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "需要图片。" }, { status: 400 });
  }

  try {
    const result = await persistUploadedImage(dataUrl, user.id);
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error, missingBlob: "missingBlob" in result ? result.missingBlob : undefined },
        { status: result.status },
      );
    }
    return NextResponse.json({ url: result.url, fallback: "fallback" in result ? result.fallback : undefined });
  } catch {
    return NextResponse.json({ error: "无法保存图片。" }, { status: 500 });
  }
}
