import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { catchDbError } from "@/lib/db-errors";
import { searchPeople } from "@/lib/friends";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { user, response } = await requireApiUser();
  if (!user) return response;
  const q = new URL(request.url).searchParams.get("q") ?? "";
  try {
    return NextResponse.json({ results: await searchPeople(q, user.id) });
  } catch (error) {
    return catchDbError(error, "无法搜索。");
  }
}
