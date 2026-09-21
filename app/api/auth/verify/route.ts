import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";
import { getAppUrl } from "@/lib/app-url";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const loginOk = `${getAppUrl()}/login?verified=1`;
  const loginBad = `${getAppUrl()}/login?verified=0`;
  if (!token) return NextResponse.redirect(loginBad);
  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.usedAt || record.expires < new Date()) {
    return NextResponse.redirect(loginBad);
  }
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } }),
    prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);
  return NextResponse.redirect(loginOk);
}
