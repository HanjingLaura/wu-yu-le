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
