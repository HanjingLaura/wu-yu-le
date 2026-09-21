import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const body = (await request.json()) as { action?: string };
  const action = body.action;
  if (action !== "accept" && action !== "decline") {
    return NextResponse.json({ error: "无效操作。" }, { status: 400 });
  }

  const row = await prisma.friendship.findUnique({ where: { id: params.id } });
  if (!row || row.status !== "PENDING" || row.addresseeId !== user.id) {
    return NextResponse.json({ error: "没有这条请求。" }, { status: 404 });
  }

  const updated = await prisma.friendship.update({
    where: { id: row.id },
    data: { status: action === "accept" ? "ACCEPTED" : "DECLINED" },
  });
  return NextResponse.json({ ok: true, status: updated.status });
}
