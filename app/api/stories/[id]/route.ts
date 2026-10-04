import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";
import { acceptedFriendIds } from "@/lib/friends";
import { storyInclude } from "@/lib/story-access";
import { catchDbError } from "@/lib/db-errors";
import { parseStoryInput, sanitizeImageUrl, toStoryRecord } from "@/lib/story-map";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const body = (await request.json()) as {
    title?: string;
    content?: string;
    happenedAt?: string;
    privacy?: string;
    peopleIds?: string[];
    objectImage?: string;
    storyImages?: string[];
  };
  const { title, content, privacy, happenedAt } = parseStoryInput(body);
  if (!title || !content) {
    return NextResponse.json({ error: "需要标题和正文。" }, { status: 400 });
  }

  try {
  const existing = await prisma.story.findUnique({ where: { id: params.id }, select: { id: true, authorId: true } });
  if (!existing || existing.authorId !== user.id) {
    return NextResponse.json({ error: "不能改这条记录。" }, { status: 403 });
  }
  const peopleIds = (await acceptedFriendIds(user.id, body.peopleIds ?? [])).slice(0, 20);
  const objectImage = sanitizeImageUrl(body.objectImage);
  const storyImages = (body.storyImages ?? []).map(sanitizeImageUrl).filter((url): url is string => Boolean(url)).slice(0, 6);
  const images = [
    ...(objectImage ? [{ url: objectImage, alt: "object", sortOrder: 0 }] : []),
    ...storyImages.map((url, index) => ({ url, alt: "story", sortOrder: index + 1 })),
  ];

  await prisma.$transaction([
    prisma.storyParticipant.deleteMany({ where: { storyId: existing.id, role: { not: "OWNER" } } }),
    prisma.storyImage.deleteMany({ where: { storyId: existing.id } }),
    prisma.story.update({
      where: { id: existing.id },
      data: {
        title,
        content,
        happenedAt,
        privacy,
        participants: {
          create: peopleIds.map((userId) => ({ userId, role: "PARTICIPANT" })),
        },
        images: images.length ? { create: images } : undefined,
      },
    }),
  ]);

  const row = await prisma.story.findUnique({ where: { id: existing.id }, include: storyInclude(user.id) });
  if (!row) return NextResponse.json({ error: "无法保存。" }, { status: 500 });
  return NextResponse.json({ ok: true, record: toStoryRecord(row, user.id) });
  } catch (error) {
    return catchDbError(error, "无法保存。");
  }
}
