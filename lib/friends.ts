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

export async function acceptedFriendIds(meId: string, candidateIds: string[]) {
  const unique = Array.from(new Set(candidateIds.filter((id) => id && id !== meId)));
  if (!unique.length) return [];
  const rows = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: meId, addresseeId: { in: unique } },
        { addresseeId: meId, requesterId: { in: unique } },
      ],
    },
    select: { requesterId: true, addresseeId: true },
  });
  const allowed = new Set<string>();
  for (const row of rows) {
    allowed.add(row.requesterId === meId ? row.addresseeId : row.requesterId);
  }
  return unique.filter((id) => allowed.has(id));
}

export async function searchPeople(query: string, meId: string) {
  const q = query.trim();
  if (q.length < 2) return [];
  const email = q.toLowerCase();
  const username = q.replace(/^@/, "").toLowerCase();
  const looksLikeEmail = email.includes("@");

  const users = await prisma.user.findMany({
    where: {
      id: { not: meId },
      OR: [
        { email },
        { username },
        ...(looksLikeEmail ? [] : [{ username: { contains: username, ...textSearch } }, { name: { contains: q, ...textSearch } }]),
      ],
    },
    select: userSelect,
    take: 20,
  });

  const ids = users.map((user) => user.id);
  const rows = ids.length
    ? await prisma.friendship.findMany({
        where: {
          OR: [
            { requesterId: meId, addresseeId: { in: ids } },
            { addresseeId: meId, requesterId: { in: ids } },
          ],
        },
      })
    : [];
  const byOther = new Map(rows.map((row) => [row.requesterId === meId ? row.addresseeId : row.requesterId, row]));

  const results = [];
  for (const user of users) {
    const row = byOther.get(user.id);
    const relation: FriendRelation = !row
      ? "none"
      : row.status === "ACCEPTED"
        ? "friends"
        : row.status === "BLOCKED"
          ? "blocked"
          : row.status === "PENDING"
            ? row.addresseeId === meId
              ? "incoming"
              : "outgoing"
            : "none";
    if (relation === "blocked") continue;
    results.push({ ...toPublicPerson(user, { revealEmail: looksLikeEmail && user.email === email }), relation });
  }
  return results;
}
