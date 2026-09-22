# Database and image storage

Production data lives in PostgreSQL. On Vercel this is usually Neon via `DATABASE_URL`. The committed Prisma schema is PostgreSQL; local sqlite is only a development shortcut.

Do not commit connection strings, `NEXTAUTH_SECRET`, or blob tokens.

## Empty Neon / first deploy

From the repo root, with the production URL in the environment (Vercel env, or a one-off local shell — do not paste secrets into the repo):

```bash
npm run db:push
```

That applies the current schema, including `User`, `Story`, `StoryImage`, `StoryParticipant`, `Comment`, `Like`, and `Friendship`.

Optional demo account (`hello@wuyule.local` / `wuyule-demo`):

```bash
npm run db:seed
```

If the production database is still empty, the homepage uses local sample cutouts only as demo fill. After the first real story is saved, the shelf reads the API.

## Local sqlite

```bash
cp .env.example .env
# set DATABASE_URL="file:./dev.db"
# set NEXTAUTH_SECRET to any long local string
# set NEXTAUTH_URL="http://localhost:3000/wuyule"
DATABASE_URL="file:./dev.db" npm run db:push
DATABASE_URL="file:./dev.db" npm run db:seed
npm run dev
```

Open http://localhost:3000/wuyule/

`prisma/with-env.mjs` swaps the schema provider to sqlite when `DATABASE_URL` starts with `file:`.

## Images

Add/edit uploads a data URL to `POST /api/uploads` (auth required), then stores the returned URL on the story.

- Production: set `BLOB_READ_WRITE_TOKEN` from a Vercel Blob store. Object and story images become durable public URLs.
- Local / missing token: small `data:` URLs are stored as a fallback. Large images fail until Blob is configured.

Without `BLOB_READ_WRITE_TOKEN`, production image durability is blocked.

## Auth URLs

`NEXTAUTH_URL` must include the app `basePath` `/wuyule`, for example `https://example.com/wuyule` or `http://localhost:3000/wuyule`.
