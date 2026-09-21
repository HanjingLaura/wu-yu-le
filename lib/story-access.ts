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

export const storyInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  participants: {
    include: { user: { select: { id: true, name: true, username: true, email: true } } },
  },
  comments: {
    orderBy: { createdAt: "asc" as const },
    include: { author: { select: { name: true, username: true, email: true } } },
  },
} satisfies Prisma.StoryInclude;
