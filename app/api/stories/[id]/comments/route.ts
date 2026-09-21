import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";
import { getCurrentUser } from "@/lib/auth";
import { storyVisibleWhere } from "@/lib/story-access";
import { toPublicPerson } from "@/lib/people";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const story = await prisma.story.findFirst({
    where: { id: params.id, AND: [storyVisibleWhere(user?.id)] },
    select: { id: true },
  });
  if (!story) return NextResponse.json({ error: "没有这条记录。" }, { status: 404 });
  const comments = await prisma.comment.findMany({
    where: { storyId: story.id },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, name: true, username: true, email: true } } },
    take: 80,
  });
  return NextResponse.json({
    comments: comments.map((comment) => ({
      id: comment.id,
      author: toPublicPerson(comment.author).name,
      text: comment.body,
    })),
  });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { user, response } = await requireApiUser();
  if (!user) return response;
  const body = (await request.json()) as { text?: string };
  const text = body.text?.trim();
  if (!text) return NextResponse.json({ error: "需要评论内容。" }, { status: 400 });

  const story = await prisma.story.findFirst({
    where: { id: params.id, AND: [storyVisibleWhere(user.id)] },
    select: { id: true },
  });
  if (!story) return NextResponse.json({ error: "没有这条记录。" }, { status: 404 });

  const comment = await prisma.comment.create({
    data: { storyId: story.id, authorId: user.id, body: text.slice(0, 500) },
    include: { author: { select: { id: true, name: true, username: true, email: true } } },
  });
  return NextResponse.json({
    ok: true,
    comment: {
      id: comment.id,
      author: toPublicPerson(comment.author).name,
      text: comment.body,
    },
  }, { status: 201 });
}
