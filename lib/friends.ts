import { prisma } from "@/lib/prisma";
import { toPublicPerson, type FriendRelation, type PublicPerson } from "@/lib/people";

const userSelect = { id: true, name: true, username: true, email: true } as const;
const textSearch = process.env.DATABASE_URL?.startsWith("file:")
  ? {}
  : { mode: "insensitive" as const };

export type FriendRequestRow = {
  id: string;
  person: PublicPerson;
};

function otherUser(
  row: {
    requesterId: string;
    addresseeId: string;
    requester: { id: string; name: string | null; username: string | null; email: string };
    addressee: { id: string; name: string | null; username: string | null; email: string };
  },
  meId: string,
) {
  return row.requesterId === meId ? row.addressee : row.requester;
}

export async function listFriendships(meId: string) {
  const rows = await prisma.friendship.findMany({
    where: {
      OR: [{ requesterId: meId }, { addresseeId: meId }],
      status: { in: ["PENDING", "ACCEPTED"] },
    },
    include: { requester: { select: userSelect }, addressee: { select: userSelect } },
    orderBy: { updatedAt: "desc" },
  });

  const friends: PublicPerson[] = [];
  const incoming: FriendRequestRow[] = [];
  const outgoing: FriendRequestRow[] = [];

  for (const row of rows) {
    const person = toPublicPerson(otherUser(row, meId));
    if (row.status === "ACCEPTED") friends.push(person);
    else if (row.addresseeId === meId) incoming.push({ id: row.id, person });
    else outgoing.push({ id: row.id, person });
  }

  return { friends, incoming, outgoing };
}

export async function relationBetween(meId: string, otherId: string): Promise<FriendRelation> {
  const row = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: meId, addresseeId: otherId },
        { requesterId: otherId, addresseeId: meId },
      ],
    },
  });
  if (!row) return "none";
  if (row.status === "ACCEPTED") return "friends";
  if (row.status === "BLOCKED") return "blocked";
  if (row.status === "PENDING") return row.addresseeId === meId ? "incoming" : "outgoing";
  return "none";
}

export async function findUserForFriendQuery(query: string, meId: string) {
  const q = query.trim();
  if (!q) return null;
  const email = q.toLowerCase();
  const username = q.replace(/^@/, "").toLowerCase();

  const exact = await prisma.user.findFirst({
    where: {
      id: { not: meId },
      OR: [{ email }, { username }],
    },
    select: userSelect,
  });
  if (exact) return exact;

  const named = await prisma.user.findMany({
    where: {
      id: { not: meId },
      name: { contains: q, ...textSearch },
    },
    select: userSelect,
    take: 2,
  });
  return named.length === 1 ? named[0] : null;
}

export async function searchPeople(query: string, meId: string) {
  const q = query.trim();
  if (!q) return [];
  const email = q.toLowerCase();
  const username = q.replace(/^@/, "").toLowerCase();

  const users = await prisma.user.findMany({
    where: {
      id: { not: meId },
      OR: [
        { email },
        { username },
        { username: { contains: username, ...textSearch } },
        { name: { contains: q, ...textSearch } },
        { email: { contains: email, ...textSearch } },
      ],
    },
    select: userSelect,
    take: 20,
  });

  const results = [];
  for (const user of users) {
    const relation = await relationBetween(meId, user.id);
    if (relation === "blocked") continue;
    results.push({ ...toPublicPerson(user), relation });
  }
  return results;
}
