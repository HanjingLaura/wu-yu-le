import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { hashToken } from "@/lib/tokens";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { token?: string; password?: string };
  if (!body.token || !body.password || body.password.length < 8) {
    return NextResponse.json({ error: "需要有效链接和至少 8 位密码。" }, { status: 400 });
  }
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(body.token) } });
  if (!record || record.usedAt || record.expires < new Date()) {
    return NextResponse.json({ error: "这个重置链接无效或已过期。" }, { status: 400 });
  }
  const passwordHash = await hashPassword(body.password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);
  return NextResponse.json({ ok: true, message: "密码已更新，可以登录。" });
}
