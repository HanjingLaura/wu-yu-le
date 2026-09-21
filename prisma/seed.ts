import { PrismaClient } from "@prisma/client";
import { APP_BASE_PATH } from "../lib/base-path";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hashPassword("wuyule-demo");
  const alice = await prisma.user.upsert({
    where: { email: "hello@wuyule.local" },
    update: { emailVerified: new Date(), passwordHash, name: "Laura", username: "laura" },
    create: {
      email: "hello@wuyule.local",
      name: "Laura",
      username: "laura",
      emailVerified: new Date(),
      passwordHash,
    },
  });
  await prisma.user.upsert({
    where: { email: "mia@wuyule.local" },
    update: { emailVerified: new Date(), passwordHash, name: "Mia Chen", username: "mia" },
    create: {
      email: "mia@wuyule.local",
      name: "Mia Chen",
      username: "mia",
      emailVerified: new Date(),
      passwordHash,
    },
  });
  await prisma.user.upsert({
    where: { email: "noah@wuyule.local" },
    update: { emailVerified: new Date(), passwordHash, name: "Noah Lin", username: "noah" },
    create: {
      email: "noah@wuyule.local",
      name: "Noah Lin",
      username: "noah",
      emailVerified: new Date(),
      passwordHash,
    },
  });
  const objectUrl = `${APP_BASE_PATH}/objects/blue-mug.png`;
  const story = await prisma.story.findFirst({
    where: { authorId: alice.id, title: "一场刚刚好的雨" },
    include: { images: true },
  });
  if (!story) {
    await prisma.story.create({
      data: {
        title: "一场刚刚好的雨",
        content: "下班路上，雨落得刚刚好。我们在街角分享一把伞，记住了这一刻。",
        happenedAt: new Date("2026-09-18T18:30:00.000Z"),
        privacy: "PUBLIC",
        authorId: alice.id,
        participants: { create: { userId: alice.id, role: "OWNER" } },
        images: { create: { url: objectUrl, alt: "object", sortOrder: 0 } },
      },
    });
  } else if (story.images.length === 0) {
    await prisma.storyImage.create({ data: { storyId: story.id, url: objectUrl, alt: "object", sortOrder: 0 } });
  }
  console.log("Seeded demo account: hello@wuyule.local / wuyule-demo");
}

main().finally(() => prisma.$disconnect());
