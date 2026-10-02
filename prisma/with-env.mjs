#!/usr/bin/env node
/**
 * Runs Prisma CLI against postgresql by default (Vercel / DATABASE_URL).
 * Local sqlite: DATABASE_URL=file:./dev.db (or PRISMA_PROVIDER=sqlite).
 * If DATABASE_URL is unset (CI/Vercel generate), a stub postgres URL is used so
 * `prisma generate` can run without a live database.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stubPostgres = "postgresql://postgres:postgres@127.0.0.1:5432/wuyule?schema=public";
const databaseUrlProvided = Boolean(process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = stubPostgres;
}

const directDatabaseUrl =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL_NON_POOLING ||
  "";
if (directDatabaseUrl) process.env.DIRECT_DATABASE_URL = directDatabaseUrl;

const url = process.env.DATABASE_URL;
const provider =
  process.env.PRISMA_PROVIDER || (url.startsWith("file:") ? "sqlite" : "postgresql");

const committedSchema = path.join(root, "prisma/schema.prisma");
let schemaPath = committedSchema;

if (provider === "sqlite" || (provider === "postgresql" && directDatabaseUrl)) {
  const generated = path.join(root, "prisma/.generated.prisma");
  mkdirSync(path.dirname(generated), { recursive: true });
  let source = readFileSync(committedSchema, "utf8");
  if (provider === "sqlite") {
    source = source.replace(/provider\s*=\s*"(sqlite|postgresql)"/, 'provider = "sqlite"');
  } else if (!source.includes("directUrl")) {
    source = source.replace(
      /url\s*=\s*env\("DATABASE_URL"\)/,
      'url = env("DATABASE_URL")\n  directUrl = env("DIRECT_DATABASE_URL")',
    );
  }
  writeFileSync(generated, source);
  schemaPath = generated;
}

const args = process.argv.slice(2);
if (args.length === 0) args.push("generate");

const isPreviewDeploy = process.env.VERCEL_ENV === "preview";
if (args[0] === "db" && args[1] === "push" && (!databaseUrlProvided || isPreviewDeploy)) {
  console.info(
    isPreviewDeploy
      ? "Skipping prisma db push on preview. Preview must use its own DATABASE_URL and must not migrate production."
      : "Skipping prisma db push: DATABASE_URL is not set.",
  );
  process.exit(0);
}

const prismaBin = path.join(root, "node_modules/.bin/prisma");
const result = spawnSync(prismaBin, [...args, "--schema", schemaPath], {
  stdio: "inherit",
  env: process.env,
  cwd: root,
});

process.exit(result.status ?? 1);
