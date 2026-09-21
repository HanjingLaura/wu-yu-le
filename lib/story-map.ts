import { APP_BASE_PATH } from "@/lib/base-path";
import { toPublicPerson } from "@/lib/people";
import type { ShelfObject, Story } from "@/lib/sample-shelf";
const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

export type StoryComment = { id: string; author: string; text: string };

export type StoryRecord = {
  story: Story;
  item: ShelfObject;
  comments: StoryComment[];
};

type MappedStory = {
  id: string;
  title: string;
  content: string;
  happenedAt: Date;
  privacy: string;
  authorId: string;
  images: { url: string; alt: string | null; sortOrder: number }[];
  participants: {
    role: string;
    user: { id: string; name: string | null; username: string | null; email: string };
  }[];
  comments: {
    id: string;
    body: string;
    author: { name: string | null; username: string | null; email: string };
  }[];
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatHappenedAt(date: Date) {
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  return {
    date: `${year} / ${month} / ${day}`,
    day: DAYS[date.getUTCDay()],
    iso: `${year}-${month}-${day}`,
  };
}

export function parseHappenedAt(value: string) {
  const iso = value.includes(" / ") ? value.split(" / ").join("-") : value;
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function sanitizeImageUrl(url: string | undefined | null) {
  if (!url) return null;
  if (url.startsWith("blob:")) return null;
  if (url.startsWith("data:") && url.length > 1_200_000) return null;
  if (url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url.startsWith("/") && !url.startsWith(`${APP_BASE_PATH}/`) && url !== APP_BASE_PATH
      ? `${APP_BASE_PATH}${url}`
      : url;
  }
  return null;
}

export function toStoryRecord(row: MappedStory, viewerId?: string | null): StoryRecord {
  const objectImage = row.images.find((image) => image.alt === "object")?.url ?? row.images[0]?.url ?? "";
  const storyImages = row.images.filter((image) => image.alt !== "object").map((image) => image.url);
  const people = row.participants
    .filter((participant) => participant.user.id !== row.authorId)
    .map((participant) => toPublicPerson(participant.user).name);
  const { date, day } = formatHappenedAt(row.happenedAt);
  const story: Story = {
    id: row.id,
    dbId: row.id,
    owned: viewerId ? row.authorId === viewerId : false,
    date,
    day,
    title: row.title,
    excerpt: row.content.replace(/\s+/g, " ").slice(0, 96),
    content: row.content,
    objectImage,
    storyImages,
    tone: "sand",
    people,
    public: row.privacy === "PUBLIC",
  };
  const item: ShelfObject = {
    id: `db-${row.id}`,
    storyId: row.id,
    date,
    title: row.title,
    objectImage,
    people,
    cutout: Boolean(objectImage),
  };
  const comments = row.comments.map((comment) => ({
    id: comment.id,
    author: toPublicPerson({
      id: "comment",
      name: comment.author.name,
      username: comment.author.username,
      email: comment.author.email,
    }).name,
    text: comment.body,
  }));
  return { story, item, comments };
}
