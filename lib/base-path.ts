/** Next.js `basePath` for portfolio hosting at /wuyule. Keep in sync with next.config.mjs. */
export const APP_BASE_PATH = "/wuyule";

/** NextAuth handler lives at app/api/auth; the public URL includes basePath. */
export const AUTH_BASE_PATH = `${APP_BASE_PATH}/api/auth`;

export function withBasePath(path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (path === APP_BASE_PATH || path.startsWith(`${APP_BASE_PATH}/`)) return path;
  return `${APP_BASE_PATH}${path}`;
}

export function apiPath(path: string) {
  return withBasePath(path.startsWith("/") ? path : `/${path}`);
}
