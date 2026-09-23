import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRawToken, hashToken } from "@/lib/tokens";
import { isMissingSchemaError } from "@/lib/db-errors";
import { allowDevMailLinks, sendOrReturnLink } from "@/lib/mail";
import { getAppUrl } from "@/lib/app-url";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  const email = body.email?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "需要填写邮箱。" }, { status: 400 });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    // Keep the response identical for unknown emails.
    if (!user) return NextResponse.json({ ok: true });

    const rawToken = createRawToken();
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashToken(rawToken), expires: new Date(Date.now() + 1000 * 60 * 30) },
    });
    const resetUrl = `${getAppUrl()}/reset-password?token=${rawToken}`;
    const mail = await sendOrReturnLink({
      to: email,
      subject: "Reset your WuyuLe password",
      text: `Reset your password here: ${resetUrl}`,
    });
    return NextResponse.json({
      ok: true,
      ...(!mail.delivered && allowDevMailLinks() ? { resetUrl, mailPreview: mail.preview } : {}),
    });
  } catch (error) {
    if (!isMissingSchemaError(error)) console.error("forgot-password failed", error);
    return NextResponse.json({ ok: true });
  }
}
