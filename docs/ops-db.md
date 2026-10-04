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

If the production database is still empty **or the schema has not been pushed**, `GET /api/stories` returns `{ records: [], source }` with HTTP 200 (`source` is `empty` after a successful query, or `missing_schema` when Prisma reports P2021). The homepage uses local sample cutouts as demo fill and shows a short note. After the first real story is saved, the shelf reads the API.

## Production status (reviewed 2026-09-23)

Verified against `https://wu-yu-le.vercel.app/wuyule/` and Vercel project `wu-yu-le` (`prj_F9Sz1inf5IVyRGtzEKiZZHTlav37`):

| Item | Status |
| --- | --- |
| Latest production deploy | READY (`ce7b007` on `main`) |
| `DATABASE_URL` (Neon, preview + production) | Present |
| `NEXTAUTH_URL` / `NEXTAUTH_SECRET` | Present (preview + production) |
| `BLOB_READ_WRITE_TOKEN` | Present after creating store `wu-yu-le-blob` (`store_6s7hIKRnAE7OtTfG`). Existing production deploy still needs a redeploy to pick it up. |
| Schema tables (`User`, `Story`, …) | **Missing** — runtime P2021 |
| SMTP / Resend | Optional; password reset in production needs working mail |

Until `npm run db:push` is run against the production `DATABASE_URL` (prefer the unpooled Neon URL), register / friends / me / story writes cannot succeed. This agent will try to push if it can reach the URL; otherwise Laura should run the command below from a machine that can see the Neon project.

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
- Local / missing token / Blob error: small `data:` URLs are stored as a fallback so the story can still save. Large images are skipped (story text still writes).

A public Blob store `wu-yu-le-blob` was created and `BLOB_READ_WRITE_TOKEN` is now on production / preview / development. Redeploy (or merge this branch) before production uploads use it.

## Password reset / verification mail

Production must not return reset tokens in API JSON. If Resend is not delivering, forgot-password only shows the generic “if the email exists” copy. Register auto-verifies when mail is not delivered so a first account can still log in; turn on Resend when you want real verification.

## Auth URLs

`NEXTAUTH_URL` must include the app `basePath` `/wuyule`, for example `https://example.com/wuyule` or `http://localhost:3000/wuyule`.
