import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function requireApiUser() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return { user: null, response: NextResponse.json({ error: "请先登录。" }, { status: 401 }) };
  }
  return { user, response: null };
}
