import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createRawToken, hashToken } from "@/lib/tokens";
import { sendTransactionalEmail } from "@/lib/mail";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string; name?: string; username?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    if (!email || !password || password.length < 8) {
      return NextResponse.json({ error: "Email and a password of at least 8 characters are required." }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

    const user = await prisma.user.create({
      data: {
        email,
        name: body.name?.trim() || null,
        username: body.username?.trim() || null,
        passwordHash: await hashPassword(password),
      },
    });
    const rawToken = createRawToken();
    await prisma.emailVerificationToken.create({
      data: { userId: user.id, tokenHash: hashToken(rawToken), expires: new Date(Date.now() + 1000 * 60 * 60 * 24) },
    });
    const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const verificationUrl = `${base}/api/auth/verify?token=${rawToken}`;
    const mail = await sendTransactionalEmail({
      to: email,
      subject: "Verify your WuyuLe email",
      text: `Welcome to WuyuLe. Verify your email here: ${verificationUrl}`,
    });
    return NextResponse.json({ ok: true, requiresVerification: true, ...(process.env.NODE_ENV !== "production" ? { verificationUrl, mailPreview: mail.preview } : {}) }, { status: 201 });
  } catch (error) {
    console.error("registration failed", error);
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
