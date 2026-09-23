import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";
import { getCurrentUser } from "@/lib/auth";
import { catchDbError, isMissingSchemaError } from "@/lib/db-errors";
import { storyInclude, storyVisibleWhere } from "@/lib/story-access";
import { acceptedFriendIds } from "@/lib/friends";
import { parseStoryInput, sanitizeImageUrl, toStoryRecord } from "@/lib/story-map";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const rows = await prisma.story.findMany({
      where: storyVisibleWhere(user?.id),
      include: storyInclude(user?.id),
      orderBy: { happenedAt: "desc" },
      take: 80,
    });
    return NextResponse.json({
      source: "db",
      records: rows.map((row) => toStoryRecord(row, user?.id)),
    });
  } catch (error) {
    if (isMissingSchemaError(error)) {
      return NextResponse.json({ source: "missing_schema", records: [] });
    }
    console.error("stories list failed", error);
    return NextResponse.json({ source: "error", records: [] }, { status: 503 });
  }
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
  const { title, content, privacy, happenedAt } = parseStoryInput(body);
  if (!title || !content) {
    return NextResponse.json({ error: "需要标题和正文。" }, { status: 400 });
  }
  try {
  const peopleIds = (await acceptedFriendIds(user.id, body.peopleIds ?? [])).slice(0, 20);
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
      happenedAt,
      privacy,
      authorId: user.id,
      participants: {
        create: [{ userId: user.id, role: "OWNER" }, ...peopleIds.map((userId) => ({ userId, role: "PARTICIPANT" }))],
      },
      images: images.length ? { create: images } : undefined,
    },
    include: storyInclude(user.id),
  });
  return NextResponse.json({ ok: true, record: toStoryRecord(row, user.id) }, { status: 201 });
  } catch (error) {
    return catchDbError(error, "无法写入。");
  }
}
