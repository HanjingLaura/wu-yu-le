import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";
import { storyVisibleWhere } from "@/lib/story-access";

export const runtime = "nodejs";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const story = await prisma.story.findFirst({
    where: { id: params.id, AND: [storyVisibleWhere(user.id)] },
    select: { id: true },
  });
  if (!story) return NextResponse.json({ error: "没有这条记录。" }, { status: 404 });

  const existing = await prisma.like.findUnique({
    where: { storyId_userId: { storyId: story.id, userId: user.id } },
    select: { id: true },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { storyId: story.id, userId: user.id } });
  }

  const likes = await prisma.like.count({ where: { storyId: story.id } });
  return NextResponse.json({ ok: true, liked: !existing, likes });
}
