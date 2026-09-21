import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createRawToken, hashToken } from "@/lib/tokens";
import { sendOrReturnLink } from "@/lib/mail";
import { getAppUrl } from "@/lib/app-url";
import { normalizeUsername, validUsername } from "@/lib/people";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string; name?: string; username?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    if (!email || !password || password.length < 8) {
      return NextResponse.json({ error: "需要邮箱和至少 8 位密码。" }, { status: 400 });
    }
    const username = normalizeUsername(body.username);
    if (body.username?.trim() && (!username || !validUsername(username))) {
      return NextResponse.json({ error: "用户名需为 2–24 位字母、数字或下划线。" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "这个邮箱已经注册。" }, { status: 409 });
    if (username) {
      const taken = await prisma.user.findUnique({ where: { username } });
      if (taken) return NextResponse.json({ error: "这个用户名已被使用。" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: body.name?.trim() || null,
        username,
        passwordHash: await hashPassword(password),
      },
    });
    const rawToken = createRawToken();
    await prisma.emailVerificationToken.create({
      data: { userId: user.id, tokenHash: hashToken(rawToken), expires: new Date(Date.now() + 1000 * 60 * 60 * 24) },
    });
    const verificationUrl = `${getAppUrl()}/api/auth/verify?token=${rawToken}`;
    const mail = await sendOrReturnLink({
      to: email,
      subject: "Verify your WuyuLe email",
      text: `Welcome to WuyuLe. Verify your email here: ${verificationUrl}`,
    });
    return NextResponse.json(
      {
        ok: true,
        requiresVerification: true,
        ...(!mail.delivered ? { verificationUrl, mailPreview: mail.preview } : {}),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("registration failed", error);
    return NextResponse.json({ error: "无法创建账号。" }, { status: 500 });
  }
}
