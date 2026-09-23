import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";
import { catchDbError } from "@/lib/db-errors";
import { normalizeUsername, toPublicPerson, validUsername } from "@/lib/people";

export const runtime = "nodejs";

function mePayload(record: { id: string; name: string | null; username: string | null; email: string }) {
  return {
    ...toPublicPerson(record),
    username: record.username,
    rawName: record.name,
    email: record.email,
  };
}

export async function GET() {
  const { user, response } = await requireApiUser();
  if (!user) return response;
  try {
    const record = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, username: true, email: true },
    });
    if (!record) return NextResponse.json({ error: "请先登录。" }, { status: 401 });
    return NextResponse.json(mePayload(record));
  } catch (error) {
    return catchDbError(error, "无法读取资料。");
  }
}

export async function PATCH(request: Request) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const body = (await request.json()) as { name?: string; username?: string };
  try {
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 40) || null : undefined;
    let username: string | null | undefined;
    if (typeof body.username === "string") {
      username = normalizeUsername(body.username);
      if (body.username.trim() && (!username || !validUsername(username))) {
        return NextResponse.json({ error: "用户名需为 2–24 位字母、数字或下划线。" }, { status: 400 });
      }
      if (username) {
        const taken = await prisma.user.findFirst({
          where: { username, id: { not: user.id } },
          select: { id: true },
        });
        if (taken) return NextResponse.json({ error: "这个用户名已被使用。" }, { status: 409 });
      }
    }

    const record = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(username !== undefined ? { username } : {}),
      },
      select: { id: true, name: true, username: true, email: true },
    });
    return NextResponse.json(mePayload(record));
  } catch (error) {
    return catchDbError(error, "无法保存。");
  }
}
