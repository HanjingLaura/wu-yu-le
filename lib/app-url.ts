import { APP_BASE_PATH } from "@/lib/base-path";

function stripTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

/**
 * Canonical public origin of this app, including `/wuyule`.
 * Uses `NEXTAUTH_URL` / `AUTH_URL` when set (do not hardcode the portfolio host).
 * If the env URL is origin-only, basePath is appended so Auth.js links stay under /wuyule.
 */
export function getAppUrl() {
  const raw = process.env.NEXTAUTH_URL || process.env.AUTH_URL;
  if (raw) {
    try {
      const url = new URL(raw);
      const path = stripTrailingSlash(url.pathname);
      if (!path || path === "/") return `${url.origin}${APP_BASE_PATH}`;
      return `${url.origin}${path}`;
    } catch {
      return stripTrailingSlash(raw);
    }
  }

  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (host) {
    const hostname = host.replace(/^https?:\/\//, "");
    return `https://${hostname}${APP_BASE_PATH}`;
  }

  return `http://localhost:3000${APP_BASE_PATH}`;
}

function originFrom(raw: string | undefined) {
  if (!raw) return null;
  try {
    return (raw.includes("://") ? new URL(raw) : new URL(`https://${raw}`)).origin;
  } catch {
    return null;
  }
}

export function allowedAuthOrigins() {
  const origins = new Set<string>();
  for (const raw of [
    process.env.NEXTAUTH_URL,
    process.env.AUTH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    "https://wu-yu-le.vercel.app",
    "https://hanjing-laura.vercel.app",
    "http://localhost:3000",
  ]) {
    const origin = originFrom(raw);
    if (origin) origins.add(origin);
  }
  return origins;
}

function withAppPath(path: string) {
  if (path === APP_BASE_PATH || path.startsWith(`${APP_BASE_PATH}/`)) return path;
  return `${APP_BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Keep NextAuth callbackUrl on this app (basePath /wuyule) and known hosts. */
export function resolveAuthRedirect(url: string) {
  const fallback = getAppUrl();
  let fallbackOrigin = "http://localhost:3000";
  try {
    fallbackOrigin = new URL(fallback).origin;
  } catch {
    /* keep localhost */
  }

  if (url.startsWith("/") && !url.startsWith("//")) {
    return `${fallbackOrigin}${withAppPath(url)}`;
  }

  try {
    const target = new URL(url);
    if (!allowedAuthOrigins().has(target.origin)) return fallback;
    if (target.pathname !== APP_BASE_PATH && !target.pathname.startsWith(`${APP_BASE_PATH}/`)) return fallback;
    return `${target.origin}${target.pathname}${target.search}`;
  } catch {
    return fallback;
  }
}
