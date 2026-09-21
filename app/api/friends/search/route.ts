import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { searchPeople } from "@/lib/friends";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { user, response } = await requireApiUser();
  if (!user) return response;
  const q = new URL(request.url).searchParams.get("q") ?? "";
  return NextResponse.json({ results: await searchPeople(q, user.id) });
}
