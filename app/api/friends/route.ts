import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";
import { catchDbError } from "@/lib/db-errors";
import { findUserForFriendQuery, listFriendships, relationBetween } from "@/lib/friends";

export const runtime = "nodejs";

export async function GET() {
  const { user, response } = await requireApiUser();
  if (!user) return response;
  try {
    return NextResponse.json(await listFriendships(user.id));
  } catch (error) {
    return catchDbError(error, "无法读取好友。");
  }
}

export async function POST(request: Request) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const body = (await request.json()) as { userId?: string; query?: string };
  try {
  const target = body.userId
    ? await prisma.user.findUnique({
        where: { id: body.userId },
        select: { id: true, name: true, username: true, email: true },
      })
    : await findUserForFriendQuery(body.query ?? "", user.id);

  if (!target) return NextResponse.json({ error: "没有找到这个人。" }, { status: 404 });
  if (target.id === user.id) return NextResponse.json({ error: "不能添加自己。" }, { status: 400 });

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: user.id, addresseeId: target.id },
        { requesterId: target.id, addresseeId: user.id },
      ],
    },
  });

  if (existing?.status === "BLOCKED") {
    return NextResponse.json({ error: "无法添加。" }, { status: 403 });
  }
  if (existing?.status === "ACCEPTED") {
    return NextResponse.json({ error: "已经是好友。" }, { status: 409 });
  }
  if (existing?.status === "PENDING" && existing.requesterId === user.id) {
    return NextResponse.json({ ok: true, status: "PENDING", id: existing.id });
  }
  if (existing?.status === "PENDING" && existing.addresseeId === user.id) {
    const row = await prisma.friendship.update({
      where: { id: existing.id },
      data: { status: "ACCEPTED" },
    });
    return NextResponse.json({ ok: true, status: "ACCEPTED", id: row.id });
  }

  const row = existing
    ? await prisma.friendship.update({
        where: { id: existing.id },
        data: { requesterId: user.id, addresseeId: target.id, status: "PENDING" },
      })
    : await prisma.friendship.create({
        data: { requesterId: user.id, addresseeId: target.id, status: "PENDING" },
      });

  const relation = await relationBetween(user.id, target.id);
  return NextResponse.json({ ok: true, status: row.status, id: row.id, relation }, { status: 201 });
  } catch (error) {
    return catchDbError(error, "无法添加。");
  }
}
