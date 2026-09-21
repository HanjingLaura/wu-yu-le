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

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = stubPostgres;
}

const url = process.env.DATABASE_URL;
const provider =
  process.env.PRISMA_PROVIDER || (url.startsWith("file:") ? "sqlite" : "postgresql");

const committedSchema = path.join(root, "prisma/schema.prisma");
let schemaPath = committedSchema;

if (provider === "sqlite") {
  const generated = path.join(root, "prisma/.generated.prisma");
  mkdirSync(path.dirname(generated), { recursive: true });
  const source = readFileSync(committedSchema, "utf8");
  writeFileSync(
    generated,
    source.replace(/provider\s*=\s*"(sqlite|postgresql)"/, 'provider = "sqlite"'),
  );
  schemaPath = generated;
}

const args = process.argv.slice(2);
if (args.length === 0) args.push("generate");

const prismaBin = path.join(root, "node_modules/.bin/prisma");
const result = spawnSync(prismaBin, [...args, "--schema", schemaPath], {
  stdio: "inherit",
  env: process.env,
  cwd: root,
});

process.exit(result.status ?? 1);
