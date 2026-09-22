import type { Prisma } from "@prisma/client";

export function storyVisibleWhere(userId?: string | null): Prisma.StoryWhereInput {
  if (!userId) return { privacy: "PUBLIC" };
  return {
    OR: [
      { authorId: userId },
      { privacy: "PUBLIC" },
      { participants: { some: { userId } } },
    ],
  };
}

export function storyInclude(viewerId?: string | null) {
  return {
    images: { orderBy: { sortOrder: "asc" as const } },
    participants: {
      include: { user: { select: { id: true, name: true, username: true, email: true } } },
    },
    comments: {
      orderBy: { createdAt: "asc" as const },
      include: { author: { select: { name: true, username: true, email: true } } },
    },
    _count: { select: { likes: true } },
    likes: viewerId
      ? { where: { userId: viewerId }, select: { userId: true }, take: 1 }
      : { select: { userId: true }, take: 0 },
  } satisfies Prisma.StoryInclude;
}
