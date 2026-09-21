export type PublicPerson = {
  id: string;
  name: string;
  handle: string;
  email: string;
  initials: string;
};

export type FriendRelation = "none" | "friends" | "incoming" | "outgoing" | "blocked";

export function initialsFrom(name: string) {
  const parts = name.replace(/^@/, "").split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function toPublicPerson(user: {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
}): PublicPerson {
  const name = (user.name?.trim() || user.username || user.email.split("@")[0] || user.email).trim();
  const handle = user.username ? `@${user.username}` : user.email;
  return { id: user.id, name, handle, email: user.email, initials: initialsFrom(name) };
}

export function normalizeUsername(value: string | null | undefined) {
  const trimmed = value?.trim().toLowerCase() ?? "";
  return trimmed || null;
}

export function validUsername(value: string) {
  return /^[a-z0-9_]{2,24}$/.test(value);
}
