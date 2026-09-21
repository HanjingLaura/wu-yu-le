import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";
import { getCurrentUser } from "@/lib/auth";
import { storyInclude, storyVisibleWhere } from "@/lib/story-access";
import { parseHappenedAt, sanitizeImageUrl, toStoryRecord } from "@/lib/story-map";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  const rows = await prisma.story.findMany({
    where: storyVisibleWhere(user?.id),
    include: storyInclude,
    orderBy: { happenedAt: "desc" },
    take: 80,
  });
  return NextResponse.json({
    records: rows.map((row) => toStoryRecord(row, user?.id)),
  });
}

export async function POST(request: Request) {
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
  const title = body.title?.trim();
  const content = body.content?.trim();
  if (!title || !content) {
    return NextResponse.json({ error: "需要标题和正文。" }, { status: 400 });
  }
  const privacy = body.privacy === "PUBLIC" ? "PUBLIC" : "PRIVATE";
  const peopleIds = Array.from(new Set((body.peopleIds ?? []).filter((id) => id && id !== user.id))).slice(0, 20);
  const objectImage = sanitizeImageUrl(body.objectImage);
  const storyImages = (body.storyImages ?? []).map(sanitizeImageUrl).filter((url): url is string => Boolean(url)).slice(0, 6);
  const images = [
    ...(objectImage ? [{ url: objectImage, alt: "object", sortOrder: 0 }] : []),
    ...storyImages.map((url, index) => ({ url, alt: "story", sortOrder: index + 1 })),
  ];

  const row = await prisma.story.create({
    data: {
      title,
      content,
      happenedAt: parseHappenedAt(body.happenedAt ?? ""),
      privacy,
      authorId: user.id,
      participants: {
        create: [{ userId: user.id, role: "OWNER" }, ...peopleIds.map((userId) => ({ userId, role: "PARTICIPANT" }))],
      },
      images: images.length ? { create: images } : undefined,
    },
    include: storyInclude,
  });
  return NextResponse.json({ ok: true, record: toStoryRecord(row, user.id) }, { status: 201 });
}
